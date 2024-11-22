const app = angular.module('app', ['ui.router', 'ui.bootstrap', 'app.services'])

app.directive('loader', ['LoaderService', function(LoaderService) {
    return {
        restrict: 'E',
        template: `
            <div class="global-loader" ng-show="LoaderService.isLoading">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `,
        controller: ['$scope', 'LoaderService', function($scope, LoaderService) {
            $scope.LoaderService = LoaderService;
        }]
    };
}])

app.config(['$urlRouterProvider', '$stateProvider', '$httpProvider', 
function($urlRouterProvider, $stateProvider, $httpProvider) {
    $httpProvider.interceptors.push('LoaderInterceptor');
    $urlRouterProvider.otherwise('/login');
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templateFiles/login.html',
            controller: 'LoginController',
            controllerAs: 'loginCtrl'
        })
        .state('user', {
            url: '/user',
            templateUrl: 'templateFiles/nav.html',
            controller: 'NavController',
            controllerAs: 'navCtrl'
        })
        .state('user.dashboard', {
            url: '/dashboard',
            templateUrl: 'templateFiles/dashboard.html',
            controller: 'DashController',
            controllerAs: 'dashCtrl'
        })
        .state('user.add', {
            url: '/add',
            templateUrl: 'templateFiles/add.html',
            controller: 'AddController',
            controllerAs: 'addCtrl'
        })
        .state('user.exam', {
            url: '/exam',
            templateUrl: 'templateFiles/exam.html',
            controller: 'ExamController',
            controllerAs: 'examCtrl'
        })
        .state('user.fRegister', {
            url: '/facultyRegister',
            templateUrl: 'templateFiles/facultyReg.html',
            controller: 'fRegController',
            controllerAs: 'fRegCtrl'
        })
        .state('user.sRegister', {
            url: '/studentRegister',
            templateUrl: 'templateFiles/studentReg.html',
            controller: 'sRegController',
            controllerAs: 'regCtrl'
        });
}])

app.controller('LoginController', ['$state', 'ApiRequest', 'ApiEndpoints',
function($state, ApiRequest, ApiEndpoints) {
    var loginCtrl = this;
    loginCtrl.email = '';
    loginCtrl.password = '';
  
    loginCtrl.login = function() {
        ApiRequest.post(ApiEndpoints.auth.login, {
            "email": loginCtrl.email,
            "password": loginCtrl.password
        }, function(response) {
            console.log(response);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message
            }).then(() => {
                $state.go('user');
            });
        });
    };
}])

app.controller('NavController', ['$state', 'ApiRequest', 'ApiEndpoints',
function($state, ApiRequest, ApiEndpoints) {
    var navCtrl = this;
    navCtrl.navs=[];

    navCtrl.logout = function() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You're about to log out!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, log out!'
        }).then((result) => {
            if (result.isConfirmed) {
                ApiRequest.get(ApiEndpoints.auth.logout, function(response) {
                    console.log(response);
                    Swal.fire(
                        'Logged Out!',
                        'You have been successfully logged out.',
                        'success'
                    ).then(() => {
                        $state.go('login');
                    });
                });
            }
        });
    };

    navCtrl.fetchNav = function() {
        ApiRequest.get(ApiEndpoints.user.navbar, function(response) {
            console.log(response);
            navCtrl.navs=response.data.data;
        });
    };

    $state.go('user.dashboard');
    navCtrl.fetchNav();
}])

app.controller('sRegController', ['$state', 'ApiRequest', 'ApiEndpoints',
function($state, ApiRequest, ApiEndpoints) {
    var regCtrl = this;
  
    regCtrl.register = function() {
        ApiRequest.post(ApiEndpoints.auth.register, {
            "email": regCtrl.email,
            "fname": regCtrl.fname,
            "mname": regCtrl.mname,
            "lname": regCtrl.lname,
            "password": regCtrl.password,
            "number": regCtrl.number,
            "dob": regCtrl.dob,
            "course": regCtrl.course,
            "year": regCtrl.year,
            "dep": regCtrl.dep,
            "section": regCtrl.section,
            "address": regCtrl.address,
            "pass1": regCtrl.pass1,
            "pass2": regCtrl.pass2
        }, function(response) {
            console.log(response);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message
            }).then(() => {
                $state.go('login');
            });
        });
    };
}]);

app.controller('fRegController', ['$state', 'ApiRequest', 'ApiEndpoints',
    function($state, ApiRequest, ApiEndpoints) {
        var fRegCtrl = this;
      
        fRegCtrl.register = function() {
            ApiRequest.post(ApiEndpoints.auth.register, {
                "email": fRegCtrl.email,
                "fname": fRegCtrl.fname,
                "mname": fRegCtrl.mname,
                "lname": fRegCtrl.lname,
                "password": fRegCtrl.password,
                "number": fRegCtrl.number,
                "dob": fRegCtrl.dob,
                "course": fRegCtrl.course,
                "year": fRegCtrl.year,
                "dep": fRegCtrl.dep,
                "section": fRegCtrl.section,
                "address": fRegCtrl.address,
                "pass1": fRegCtrl.pass1,
                "pass2": fRegCtrl.pass2
            }, function(response) {
                console.log(response);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                }).then(() => {
                    $state.go('login');
                });
            });
        };
}]);

