(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', dashboard]);

    function dashboard(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.scriptList = [];
        vm.messageCount = 0;

        activate();

        function activate() {
            var promises = [getScriptList()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Dashboard View'); });
        }

        function getScriptList() {
            return datacontext.getScriptList().then(function (data) {
                for (var key in data) {
                    data[key].callCount = datacontext.getCallCount(data[key].callId);
                }
                return vm.scriptList = data;
            });
        }
    }
})();