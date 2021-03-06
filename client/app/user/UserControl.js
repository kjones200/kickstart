/*
    UserControl.js - User Controller
 */
 
'use strict';

angular.module('app').controller('UserControl', function (Esp, User, $rootScope, $route, $scope, $location, $modal, $routeParams, $timeout) {
    angular.extend($scope, $routeParams);
    $scope.options = { roles: {}};
    angular.forEach(Esp.config.login.abilities, function(value, key) {
        $scope.options.roles[key] = key;
        $scope.options[key] = {
            "true":  "Enabled",
            "false": "Disabled",
        };
    })
    $scope.user = {};

    //  MOB - reverse this loging and put the else case as then case
    if (Esp.user || !Esp.config.loginRequired) {
        if ($scope.id) {
            User.get({id: $scope.id}, $scope, function(response) {
                console.log(response);
            });
        } else if ($location.path().indexOf('/user/list') == 0) {
            User.list(null, $scope, {users: "data"});
        } else if ($location.path() == "/user/") {
            User.init(null, $scope);
        }
    } else {
        var loc = $location.path();
        if ($location.path().indexOf('/user/login') == 0) {
            $rootScope.feedback = { warning: "Insufficient Privilege to view users" };
        }
    }

    $scope.save = function() {
        User.update($scope.user, $scope, function(response) {
            if (!response.error) {
                $location.path('/user/list');
            }
        });
    };

    $scope.login = function(dialog) {
        User.login($scope.user, function(response, fn) {
            if (response.error) {
                Esp.logout();
                $location.path("/");
            } else {
                Esp.login(response.user);
                dialog.dismiss();
                if ($rootScope.referrer) {
                    $location.path($rootScope.referrer.$$route.originalPath);
                    $rootScope.referrer = null;
                } else {
                    $location.path("/");
                }
            }
        });
    };

    $scope.logout = function() {
        if (Esp.user) {
            Esp.logout();
            User.logout({}, function() {
                $rootScope.feedback = { inform: "Logged Out" };
                $location.path("/");
                $route.reload();
            });
        } else {
            $rootScope.feedback = { inform: "Logged Out" };
            $location.path("/");
        }
    };

    $scope.forgot = function() {
        var esp = angular.module('esp');
        var confirm = $modal.open({
            scope: $scope,
            templateUrl: esp.url('/app/user/user-forgot.html'),
        });
        confirm.result.then(function(result) {
            if (result) {
                User.forgot($scope.user, function(response, fn) {
                    $location.path("/");
                });
            }
        });
    };

    $scope.remove = function() {
        $modal.open({
            scope: $scope,
            template: '<esp-confirm header="Are you sure?" body="Do you want to remove user: {{user.username}}?" ok="Delete User">',
        }).result.then(function(result) {
            if (result) {
                User.remove({id: $scope.user.id}, function(response) {
                    $location.path("/user/list");
                });
            }
        });
    };
});

/*
    User controller routes for login
 */
angular.module('app').config(function($routeProvider) {
    var Default = {
        controller: 'UserControl',
        resolve: { action: checkAuth },
    };
    var esp = angular.module('esp');
    $routeProvider.when('/user/list',   angular.extend({}, Default, {templateUrl: esp.url('/app/user/user-list.html')}));
    $routeProvider.when('/user/login',  angular.extend({}, Default, {templateUrl: esp.url('/app/user/user-login.html')}));
    $routeProvider.when('/user/logout', angular.extend({}, Default, {template: '<p ng-init="logout()">Hello</p>'}));
    $routeProvider.when('/user/:id', angular.extend({}, Default, {
        templateUrl: esp.url('/app/user/user-edit.html'),
        abilities: { 'edit': true, 'view': true },
    }));
});
