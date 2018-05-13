var app = angular.module('TaskManager', ['ngRoute', 'ui.codemirror', 'ngclipboard']);
var messagesArray = [];
var inputMessages = [];
var userId = makeId();

app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'homeController'
        })
        .otherwise({
            templateUrl: 'partials/home.html',
            controller: 'homeController'
        });

    $locationProvider.html5Mode(true);
});

var server = io('https://9746a98b.ngrok.io/');

function makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

setInterval(function () {
    //console.log("set interval");
    if (messagesArray.length) {
        // console.log("messagesArray[0]", messagesArray[0]);
        server.emit('messages', messagesArray[0]);
        messagesArray.shift();
    }
}, 150);

app.directive('modal', function () {
    return {
        template: '<div class="modal fade">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '<h4 class="modal-title">{{ title }}</h4>' +
        '</div>' +
        '<div class="modal-body" ng-transclude></div>' +
        '</div>' +
        '</div>' +
        '</div>',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: true,
        link: function postLink(scope, element, attrs) {
            scope.title = attrs.title;

            scope.$watch(attrs.visible, function (value) {
                if (value == true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });

            $(element).on('shown.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = true;
                });
            });

            $(element).on('hidden.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
});


app.controller('homeController', function ($scope, $http, $window, $interval, $location, $timeout,) {
    $scope.selectedTheme = 'elegant';
    $scope.themes = ['default', '3024', '3024', 'abcdef', 'ambiance', 'base16', 'base16', 'bespin', 'blackboard', 'cobalt', 'colorforth', 'dracula', 'duotone', 'duotone', 'eclipse', 'elegant', 'erlang', 'gruvbox', 'hopscotch', 'icecoder', 'idea', 'isotope', 'lesser', 'liquibyte', 'lucario', 'material', 'mbo', 'mdn', 'midnight', 'monokai', 'neat', 'neo', 'night', 'oceanic', 'panda', 'paraiso', 'paraiso', 'pastel', 'railscasts', 'rubyblue', 'seti', 'shadowfox', 'solarized', 'solarized', 'the', 'tomorrow', 'tomorrow', 'ttcn', 'twilight', 'vibrant', 'xq', 'xq', 'yeti', 'zenburn']
    $scope.myName = userId;
    $scope.myColour = getRandomColor();
    // console.log("colour", $scope.myColour);
    $scope.anotherName = [];
    var server = io('https://9746a98b.ngrok.io/');

    //var userId = "";

    $scope.showModal = false;

    $scope.toggleModal = function () {
        $scope.showModal = !$scope.showModal;
    };

    $interval(function () {
        if (inputMessages.length) {
            var msg = inputMessages[0];
            inputMessages.shift();
            var _editor = msg.editor;
            if (msg.userId != userId) {
                var lastLine = _editor.lastLine();
                var extraLine = "";
                for (var i = lastLine; i <= msg.line; i++) {
                    extraLine += "\n"
                }
                _editor.setValue($scope.text + extraLine);

                if (msg.type == "add") {
                    _editor.replaceRange(msg.letter, {"line": msg.line, "ch": msg.ch - 1}, {
                        "line": msg.line,
                        "ch": msg.ch
                    });
                } else {
                    _editor.replaceRange(msg.letter, {"line": msg.line, "ch": msg.ch}, {
                        "line": msg.line,
                        "ch": msg.ch + 1
                    })
                }
            }
        }
    }, 150);

    $scope.newroomid = "";

    $scope.goToRoom = function () {
        $window.location.href = "https://9746a98b.ngrok.io/" + $scope.newroomid;
    };


    //$

    server.on('connect', function (data) {
        $scope.shareLink = $location.absUrl();
        $scope.roomId = $scope.shareLink.split('?')[0].split('/')[3];
        var path = $location.absUrl().split('?')[0].split('/')[3];
        server.emit('join', JSON.stringify({roomId: path, userId: userId, colour: $scope.myColour, name: userId}));
    });

    $scope.submitName = function () {
        var path = $location.absUrl().split('?')[0].split('/')[3];
        server.emit('name', JSON.stringify({roomId: path, userId: userId, name: $scope.myName, colour: $scope.myColour}));
    };

    server.on('name', function (data) {
        var data = JSON.parse(data);
        var t = 0;
        if (data.userId != userId) {
            $scope.anotherName.forEach(function (anotherName) {
                if (data.userId == anotherName.userId) {
                    anotherName["name"] = data.name;
                    t = 1
                }
            });
            if (t == 0) {
                $scope.anotherName.push(data);
            }
        }
    });

    server.on('join', function (data) {
        var data = JSON.parse(data);
        if (data.userId != userId) {
            $scope.anotherName.push(data);
        }
    });

    server.on('remove', function (messages) {
        //alert(messages);
    });

    //$scope.launch = function () {
    //    // console.log("check");
    //    var dlg = $dialogs.error('This is my error message');
    //}


    $scope.editorOptions = {
        lineWrapping: true,
        lineNumbers: true,
        focused: true,
        autofocus: true,
        tabindex: 0,
        coverGutterNextToScrollbar: true,
        mode: 'xml',
        theme: $scope.selectedTheme,
    };

    $scope.codemirrorLoaded = function (_editor) {
        $scope.themeSelected = function () {

            $scope.editorOptions = {
                lineWrapping: true,
                lineNumbers: true,
                focused: true,
                autofocus: true,
                tabindex: 0,
                coverGutterNextToScrollbar: true,
                mode: 'xml',
                theme: $scope.selectedTheme,
            };
            // $scope.editorOptions['theme'] = $scope.selectedTheme;
            $scope.isSomething = true;
            _editor.refresh();
            //$timeout
            //console.log($scope.selectedTheme);
        };

        _editor.setSize(-1, 600);
        $scope.text = "";

        server.on('messages', function (messages) {
            var msg = JSON.parse(messages);
            msg.editor = _editor;
            inputMessages.push(msg);
        });

        //server.on('remove', function (messages) {
        //    //alert(messages);
        //});

        var preLine = 0;
        var preCh = 0;

        $scope.showInfo = function (d) {
            data = _editor.getCursor();
            var line = data.line;
            var ch = data.ch;
            var letter = "";
            var path = $location.absUrl().split('?')[0].split('/')[3];
            if (preLine == line && preCh < ch) {
                letter = _editor.getRange({"line": data.line, "ch": data.ch - 1}, {"line": data.line, "ch": data.ch});
                console.log(letter);
                messagesArray.push(JSON.stringify({
                    roomId: path,
                    userId: userId,
                    line: line,
                    ch: ch,
                    letter: letter,
                    "type": "add"
                }));
            } else if (preLine == line && preCh > ch) {
                messagesArray.push(JSON.stringify({
                    roomId: path,
                    userId: userId,
                    line: line,
                    ch: ch,
                    letter: letter,
                    "type": "delete"
                }));
            }
            preLine = data.line;
            preCh = data.ch;
        }

        var updateUserCursor = function(userId, color, cursorPos) {
          var id = userId;
          var elmn = angular.element( document.querySelector('#'+id));
          elmn.remove();
          const cursorCoords = _editor.cursorCoords(cursorPos);
          const cursorElement = document.createElement('span');
          cursorElement.setAttribute("id", id);
          cursorElement.style.borderLeftStyle = 'solid';
          cursorElement.style.borderLeftWidth = '2px';
          cursorElement.style.borderLeftColor = color;
          cursorElement.style.height = `${(cursorCoords.bottom - cursorCoords.top)}px`;
          cursorElement.style.padding = 0;
          cursorElement.style.zIndex = 0;
          marker = _editor.setBookmark(cursorPos, { widget: cursorElement, id: id });
        }

      $scope.sendCursor = function() {
        var cursorPos = _editor.getCursor();
        server.emit('cursor', JSON.stringify({roomId: $scope.roomId, userId: userId, colour: $scope.myColour, line: cursorPos.line, ch: cursorPos.ch}));
      }

      server.on('cursor', function (data) {
          var data = JSON.parse(data);
          if (data.userId != userId) {
            var lastLine = _editor.lastLine();
            var extraLine = "";
            for (var i = lastLine; i <= data.line; i++) {
                extraLine += "\n"
            }
            _editor.setValue($scope.text + extraLine);

            updateUserCursor(data.userId, data.colour, { "line": data.line, "ch": data.ch});
          }
      });

    };
});
