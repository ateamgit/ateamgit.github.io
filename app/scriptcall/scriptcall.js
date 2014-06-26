(function () {
    'use strict';
    var controllerId = 'ScriptCall';
    angular.module('app').controller(controllerId, ['common', 'datacontext', '$scope', '$routeParams', '$sce', scriptCall]);

    function scriptCall(common, datacontext, $scope, $routeParams, $sce) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var vm = this;

        vm.name = 'Тестовый прокет 1';
        vm.callCount = 8;
        
        vm.callWay = [];
        
        vm.selectedOption = null;
        vm.optionList = [];
        /*[
            {
                id: '[С-1]',
                name: 'Добрый день!',
                txt: 'Добрый день! Это _«название компании»_?',
                options: [
                    "[С-4][]",
                    "[С-2][]",
                    "[К-4][]",
                    "[С-1 1][]",
                    "[С-1 2][]"
                ],
                way: []
            },
            {
                id: '[С-1 1]',
                name: 'Перезвон после отправки информационных материалов',
                txt: '[_**Если имя ЛПР известно (смотрим в базе)**_]: Добрый день! Меня зовут «_Ваше имя_», компания «_Ваша компания_». Соедините, пожалуйста, с «_Имя ЛПР_».  '+
'[_**Если имя ЛПР неизвестно**_]: Добрый день, меня зовут «_Ваше имя_», компания «_Ваша компания_». Мы высылали Вам информационные материалы по электронной почте. Соедините, пожалуйста, с тем, кто с ними ознакомился.  '+
'[_**Никто не ознакомился**_]: А Вы получили материалы?  '+
'[_**Получили**_]: А когда Вы сможете ознакомиться? В какое время перезвонить? _(_записать_)_ Хорошо, мы перезвоним _(назвать дату)_. До свидания. _((Результат: «Перезвонить» ))_  '+
'[_**Не получили**_]: А в спаме смотрели? Это адрес вашей электронной почты? _(прочитать адрес почты из базы)_. Подскажите адрес другой _(личной)_ почты _(_записать_)_, мы отправим информацию повторно. Отправим сегодня же и перезвоним через пару дней. До свидания.  _((Результат: «Перезвонить» + выслать КП повторно ))_',
                options: [
                    "[П-10][]",
                    "[П-10 1][]",
                    "[С-4 1][]",
                    "[С-4 2][]",
                    "[С-5][]",
                    "[С-6][]",
                    "[С-6 2][]",
                    "[С-7][]",
                    "[С-8][]",
                    "[К-6][]",
                    "[С-9][]"
                ],
                way: []
            }];*/
        vm.converter = new Markdown.Converter();
        vm.selectOption = function (selected) {
            vm.callWay.push(selected);
            for (var key in vm.optionList) {
                if (selected !== undefined && selected.id !== undefined && vm.optionList[key].id === selected.id) {
                    vm.selectedOption = vm.optionList[key];
                    vm.selectHtml();
                    ReLayout();
                    return;
                }
            }
        };
        
        vm.selectedHtml = "";
        vm.selectHtml = function () {
            vm.selectedHtml = $sce.trustAsHtml(vm.converter.makeHtml(vm.selectedOption.txt));
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
                vm.selectedOption = data[0];
                vm.selectHtml();
                return vm.optionList = data;
            });
        }

        function getScriptList() {
            return datacontext.getScriptList().then(function (data) {
                return vm.scriptList = data;
            });
        }
    }
})();