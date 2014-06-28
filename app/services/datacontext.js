(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId, ['common', '$http', '$q', datacontext]);

    function datacontext(common, $http) {
        var service = {
            ScriptList: null,
            getScriptList: getScriptList,
            getScript: getScript,
            selectScript: selectScript
        };
        return service;

        function getScriptList() {
            var url ='project/index.json';
            var ctx = this;
            var promise = $http.get(url).then(function (response) {
                ctx.ScriptList = response.data;
                return response.data;
            });
            return promise;
        }

        function getScript() {
            var promise = $http.get(this.selectedScript.uri).then(function (response) {
                var list = loadScript(response.data);
                return list;
            });
            return promise;
        }
        
        function selectScript(callId) {
            for (var key in this.ScriptList) {
                if (this.ScriptList[key].id == callId) {
                    this.selectedScript = this.ScriptList[key];
                    return;
                }
            }
        }

        function loadScript(data) {
            var strs = data.split("\r");
            var list = [];
            var index = [];
            var script = {};
            var state = "begin";
            var substate = "";
            for (var key in strs) {
                var val = strs[key];
                val = val.replace(/(\r\n|\n|\r)/gm, "").trim();
                if (state == "begin") {
                    if (val[0] == "#") {
                        if (val.length == 0) {
                        }
                        else if (val[1] == "#") {
                            state = "part";
                            continue;
                        } else {
                            state = "name";
                        }
                    }
                }
                if (state == "name") {
                    if (val.length == 0) {
                        state = "index";
                    }
                    else
                        script.name = val.substr(1);
                    continue;
                }
                if (state == "index") {
                    if (val.length == 0) {
                        state = "begin";
                    } else {
                        var i = readIndex(val);
                        index[i.id] = i;
                    }
                    continue;
                }
                if (state == "part") {
                    if (val.length == 0) {
                        substate = '';
                    }
                    else if (substate == 'way') {
                        var w = list[list.length - 1].way;
                        if (val[0] == '>')
                            w.push(val.substr(1));
                        else
                            w[w.length-1] = w[w.length-1] + val;
                    }
                    else if (val[0] == "#") {
                        state = "begin";
                    }
                    else {
                        if (val[0] == '['
                            && val[val.length - 2] == '['
                            && val[val.length - 1] == ']') {
                            var id = val.substr(0, val.length - 2);
                            list.push({ id: id, name: index[id].name, txt: "", options: [], way: [] });
                        }
                        else if (val[0] == '1' && val[1] == '.' && val[2] == ' ' && val[3] == '[') {
                            list[list.length - 1].options.push(val.substr(3));
                        }
                        else if (val[0] == '>') {
                            list[list.length - 1].way.push(val.substr(1));
                            substate = 'way';
                        }
                        else {
                            list[list.length - 1].txt += val;
                        }
                    }
                    continue;
                }
            }
            linkOptions(list);
            return list;
        }

        function readIndex(data) {
            var a = data.indexOf('[');
            var b = data.indexOf(']') + 1;
            var c = data.indexOf('>') + 1;
            var id = data.substr(a, b - a);
            var name = data.substr(c).trim();
            return { id: id, name: name };
        }

        function linkOptions(data) {
            for (var l in data) {
                var t = data[l];
                var ol = [];
                if (t.options != null)
                    for (var i = 0; i < t.options.length; i++) {
                        var o = t.options[i];
                        ol.push(o);
                        for (var d in data) {
                            var m = data[d];
                            if (m.id + '[]' == o) {
                                ol[i] = m;
                            }
                        }
                        if (ol[i] == o) {
                            ol[i] = {};
                            ol[i].name = o;
                        }
                    }
                t.options = ol;
            }
        }

    }
})();