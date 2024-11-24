const app = angular.module('app', ['ui.router', 'ui.bootstrap', 'app.services'])

app.directive('loader', ['LoaderService', function(LoaderService) {
    return {
        restrict: 'E',
        template: `
            <div class="global-loader" ng-show="LoaderService.isLoading">
                <button class="btn btn-secondary global-loader" ng-show="LoaderService.isLoading type="button" disabled>
                <span class="spinner-border spinner-border-sm p-2 " role="status" aria-hidden="true"></span>
                Loading...
                </button>
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
        // .state('user.exam', {
        //     url: '/exam',
        //     templateUrl: 'templateFiles/exam.html',
        //     controller: 'ExamController',
        //     controllerAs: 'examCtrl'
        // })
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
        })
        .state('user.records', {
            url: '/staffRecords',
            templateUrl: 'templateFiles/staff.html',
            controller: 'staffController',
            controllerAs: 'staffCtrl'
        })
        .state('user.schedule', {
            url: '/schedule',
            templateUrl: 'templateFiles/schedule.html',
            controller: 'schedController',
            controllerAs: 'schedCtrl'
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

// app.controller('NavController', ['$state', 'ApiRequest', 'ApiEndpoints',
// function($state, ApiRequest, ApiEndpoints) {
//     var navCtrl = this;
//     navCtrl.navs=[];

//     navCtrl.logout = function() {
//         Swal.fire({
//             title: 'Are you sure?',
//             text: "You're about to log out!",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, log out!'
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 ApiRequest.get(ApiEndpoints.auth.logout, function(response) {
//                     console.log(response);
//                     Swal.fire(
//                         'Logged Out!',
//                         'You have been successfully logged out.',
//                         'success'
//                     ).then(() => {
//                         $state.go('login');
//                     });
//                 });
//             }
//         });
//     };
    
//     navCtrl.fetchNav = function() {
//         ApiRequest.get(ApiEndpoints.user.navbar, function(response) {
//             console.log(response);
//             navCtrl.navs=response.data;
//         });
//     };

//     $state.go('user.dashboard');
//     navCtrl.fetchNav();
// }])

// app.controller('NavController', ['$state', 'ApiRequest', 'ApiEndpoints', function($state, ApiRequest, ApiEndpoints) {
//     var navCtrl = this;
//     navCtrl.navs = [];

//     navCtrl.fetchNav = function() {
//         ApiRequest.get(ApiEndpoints.user.navbar, function(response) {
//             navCtrl.navs = response.data.map(function(item) {
//                 if (item.children && item.children.length > 0) {
//                     item.type = 'dropdown';
//                     item.subItems = item.children.map(function(child) {
//                         return {
//                             title: child.title,
//                             url: child.url
//                         };
//                     });
//                 } else {
//                     item.type = 'single';
//                 }
//                 return item;
//             });
//         });
//     };

//     navCtrl.navigateTo = function(item) {
//         if (item.url) {
//             $state.go('user.' + item.url);
//         }
//     };

//     $state.go('user.dashboard');
//     navCtrl.fetchNav();
// }]);

app.controller('NavController', ['$state', 'ApiRequest', 'ApiEndpoints', 
    function($state, ApiRequest, ApiEndpoints) {
        var navCtrl = this;
        
        navCtrl.navs = [
            {
                title: "Dashboard",
                icon: "bi bi-speedometer2",
                url: "dashboard",
                type: "single"
            },
            // {
            //     title: "Registration",
            //     icon: "bi bi-layout-text-window",
            //     type: "dropdown",
            //     subItems: [
            //         {
            //             title: "Student Registration", 
            //             url: "sRegister"
            //         },
            //         {
            //             title: "Faculty Registration", 
            //             url: "fRegister"
            //         }
            //     ]
            // },
            {
                title: "Records",
                icon: "bi bi-file-earmark-bar-graph",
                type: "dropdown",
                subItems: [
                    {
                        title: "Student Records",
                        url: "studentRec"
                    },
                    {
                        title: "Faculty Records",
                        url: "facultyRec"
                    }
                ]
            },
            {
                title: "Add New",
                icon: "bi bi-plus-circle-fill",
                url: "add",
                type: "single"
            },
            {
                title: "Staff Records",
                icon: "bi bi-file-earmark-bar-graph",
                url: "records",
                type: "single"
            },
            {
                title: "Student Registration",
                icon: "bi bi-layout-text-window",
                url: "sRegister",
                type: "single"
            },
            {
                title: "Faculty Registration",
                icon: "bi bi-layout-text-window",
                url: "fRegister",
                type: "single"
            },
            {
                title: "Schedule",
                icon: "bi bi-calendar4-event",
                url: "schedule",
                type: "single"
            }
        ];

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

        navCtrl.navigateTo = function(item) {
            if (item.url) {
                $state.go('user.' + item.url);
            }
        };

        $state.go('user.dashboard');
    }
]);

app.controller('AcademicController', ['$state', 'ApiRequest', 'ApiEndpoints',
    function($state, ApiRequest, ApiEndpoints) {
        var academicCtrl = this;
        academicCtrl.academicData = {
            courses: [
                {
                    id: 1,
                    name: "B.Tech",
                    duration: "4 Years",
                    departments: [
                        {
                            id: 1,
                            name: "Computer Science",
                            years: [
                                {
                                    year: "1st Year",
                                    sections: [
                                        {
                                            name: "A",
                                            strength: 60,
                                            subjects: [
                                                {
                                                    code: "CS101",
                                                    name: "Programming Fundamentals",
                                                    faculty: "Dr. Jane Smith",
                                                    credits: 4
                                                }
                                            ]
                                        },
                                        {
                                            name: "B",
                                            strength: 60,
                                            subjects: [
                                                {
                                                    code: "CS101",
                                                    name: "Programming Fundamentals",
                                                    faculty: "Dr. Bob Wilson",
                                                    credits: 4
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    year: "2nd Year",
                                    sections: []
                                }
                            ]
                        },
                        {
                            id: 2,
                            name: "Electronics",
                            years: []
                        }
                    ]
                },
                {
                    id: 2,
                    name: "M.Tech",
                    duration: "2 Years",
                    departments: []
                }
            ]
        };

        academicCtrl.facultyData = {
            departments: [
                {
                    id: 1,
                    name: "Computer Science",
                    faculty: [
                        {
                            id: 1,
                            name: "Dr. John Doe",
                            designation: "Professor",
                            specialization: "Machine Learning",
                            subjects: ["CS101", "CS405"]
                        }
                    ]
                }
            ]
        };

        academicCtrl.loadAcademicData = function() {
            ApiRequest.get(ApiEndpoints.ACADEMIC_DATA)
                .then(function(response) {
                    academicCtrl.academicData = response.data;
                })
                .catch(function(error) {
                    console.error('Error loading data:', error);
                });
        };

        academicCtrl.loadFacultyData = function() {
            ApiRequest.get(ApiEndpoints.FACULTY_DATA)
                .then(function(response) {
                    academicCtrl.facultyData = response.data;
                })
                .catch(function(error) {
                    console.error('Error loading faculty data:', error);
                });
        };

        
        // academicCtrl.getDepartmentsByCourse = function(courseId) {
        //     var course = academicCtrl.academicData.courses.find(c => c.id === courseId);
        //     return course ? course.departments : [];
        // };

        // academicCtrl.getYearsByDepartment = function(courseId, deptId) {
        //     var departments = academicCtrl.getDepartmentsByCourse(courseId);
        //     var dept = departments.find(d => d.id === deptId);
        //     return dept ? dept.years : [];
        // };

        // academicCtrl.getSectionsByYear = function(courseId, deptId, year) {
        //     var years = academicCtrl.getYearsByDepartment(courseId, deptId);
        //     var yearData = years.find(y => y.year === year);
        //     return yearData ? yearData.sections : [];
        // };

        // academicCtrl.getFacultyByDepartment = function(deptId) {
        //     var department = academicCtrl.facultyData.departments.find(d => d.id === deptId);
        //     return department ? department.faculty : [];
        // };

        // academicCtrl.getCurrentPath = function() {
        //     var path = [];
        //     if (academicCtrl.selected.course) {
        //         path.push(academicCtrl.selected.course.name);
        //         if (academicCtrl.selected.department) {
        //             path.push(academicCtrl.selected.department.name);
        //             if (academicCtrl.selected.year) {
        //                 path.push(academicCtrl.selected.year);
        //                 if (academicCtrl.selected.section) {
        //                     path.push('Section ' + academicCtrl.selected.section.name);
        //                 }
        //             }
        //         }
        //     }
        //     return path.join(' > ');
        // };
    }
]);

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

