(function () {
    'use strict';
    var controllerId = 'ScriptCall';
    angular.module('app').controller(controllerId, ['common', 'datacontext', '$scope', '$routeParams', '$sce', scriptCall]);

    function scriptCall(common, datacontext, $scope, $routeParams, $sce) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var vm = this;

        vm.currentCall = {};
        vm.currentCall.name = '';
        vm.currentCall.callCount = 0;
        vm.currentCall.callWay = [];
        vm.currentCall.replaceTxt = "Имя ЛПР - Зоя\r\nназвание компании ";
        vm.currentCall.callId = $routeParams.callId;
        
        vm.optionList = [];
        
        vm.selectedOption = null;
        vm.selectedHtml = "";
        vm.selectedWayHtml = [];
            
        vm.converter = new Markdown.Converter();
        
        vm.selectOption = function (selected) {
            vm.currentCall.callWay.push(selected);
            for (var key in vm.optionList) {
                if (selected !== undefined && selected.id !== undefined && vm.optionList[key].id === selected.id) {
                    vm.selectedOption = vm.optionList[key];
                    vm.selectHtml();
                    ReLayout();
                    return;
                }
            }
        };

        vm.endCall = function (result) {
            vm.currentCall.result = result;
            datacontext.addCall(vm.currentCall);
            $("#navCallCount").each(function () {
                var $cont = $(this);
                $cont.text(datacontext.callCount);
            });
        };
        
        vm.selectHtml = function () {
            vm.selectedHtml = $sce.trustAsHtml(vm.converter.makeHtml(vm.replaceTemplate(vm.selectedOption.txt)));
            vm.selectedWayHtml = new Array();
            for (var key in vm.selectedOption.way) {
                var w = vm.replaceTemplate(vm.selectedOption.way[key]);
                w = $sce.trustAsHtml(vm.converter.makeHtml(w));
                vm.selectedWayHtml[key] = w;
            }
        };

        $scope.changedText = "";
        $scope.changeReplaceTxt = function () {
            vm.currentCall.replaceTxt = $scope.changedText;
            vm.selectHtml();
        };

        vm.replaceTemplate = function (inStr) {
            var outStr = inStr;
            if (vm.currentCall.replaceTxt.trim().length === 0)
                return outStr;
            var strs = vm.currentCall.replaceTxt.split("\n");
            for (var s in strs) {
                var val = strs[s].replace(/(\r\n|\n|\r)/gm, "").trim();
                if (val.trim().length === 0)
                    return outStr;
                var splits = val.split("-");
                if (splits.length > 1) {
                    var search = splits[0].trim();
                    var replacement = splits[1].trim();
                    outStr = outStr.split(search).join(replacement);
                }
            }
            return outStr;
        };

        activate();
        
        function activate() {
            var promises = [getScript()];
            common.activateController(promises, controllerId)
                .then(function() {
                    log('Activated Dashboard View');
                });
        }

        function getScript() {
            datacontext.selectScript($routeParams.callId);
            return datacontext.getScript().then(function (data) {
                vm.currentCall.name = datacontext.selectedScript.name;
                vm.currentCall.callCount = datacontext.getCallCount($routeParams.callId) + 1;

                $scope.changedText = vm.currentCall.replaceTxt;
                
                vm.selectedOption = data[0];
                vm.selectHtml();
                return vm.optionList = data;
            });
        }
    }
})();
