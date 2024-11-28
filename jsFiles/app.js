const app = angular.module('app', ['ui.router', 'ui.bootstrap', 'app.services'])

BASE_URL= 'https://10.21.98.228:8000';

app.directive('loader', ['LoaderService', function(LoaderService) {
    return {
        restrict: 'E',
        template: `
            <div class="global-loader" ng-show="LoaderService.isLoading">
                <div class="loader-content">
                    <div class="spinner-ripple">
                        <div></div>
                        <div></div>
                    </div>
                    <div class="loader-text">Loading...</div>
                </div>
            </div>
        `,
        controller: ['$scope', 'LoaderService', function($scope, LoaderService) {
            $scope.LoaderService = LoaderService;
        }]
    };
}])

// toggleMode() {
//     this.document.body.classList.toggle(Mode.LIGHT);
//     this.document.body.classList.toggle(Mode.DARK);
//     if (this.currentMode === Mode.LIGHT) {
//       this.updateCurrentMode(Mode.DARK);
//     } else {
//       this.updateCurrentMode(Mode.LIGHT);
//     }
// }

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
        .state('user.staffRec', {
            url: '/staffRecords',
            templateUrl: 'templateFiles/staff.html',
            controller: 'staffController',
            controllerAs: 'staffCtrl'
        })
        .state('user.studentRec', {
            url: '/makeQuestion',
            templateUrl: 'templateFiles/students.html',
            controller: 'questionController',
            controllerAs: 'qpCtrl'
        })
        .state('user.schedule', {
            url: '/schedule',
            templateUrl: 'templateFiles/schedule.html',
            controller: 'schedController',
            controllerAs: 'schedCtrl'
        });
}])

app.controller('LoginController', ['$state', 'ApiRequest', 'ApiEndpoints', function($state, ApiRequest, ApiEndpoints) {
    var loginCtrl = this;
    loginCtrl.email = '';
    loginCtrl.password = '';
    
    loginCtrl.login = function() {
        var loginData = {
            "email": loginCtrl.email,
            "password": loginCtrl.password
        };
  
        ApiRequest.post(ApiEndpoints.auth.login, loginData, function(response) {
            console.log('Login response:', response);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message 
            }).then(() => {
                $state.go('user');
            });
        });
    };
  }]);

  app.controller('NavController', ['$state', 'ApiRequest', 'ApiEndpoints', function($state, ApiRequest, ApiEndpoints) {
    var navCtrl = this;
    
    navCtrl.currentMode = localStorage.getItem('appMode') || 'dark';
    
    navCtrl.toggleMode = function() {
        navCtrl.currentMode = navCtrl.currentMode === 'dark' ? 'light' : 'dark';
        localStorage.setItem('appMode', navCtrl.currentMode);
        applyMode();
    };
    
    function applyMode() {
        if (navCtrl.currentMode === 'dark') {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        }
    }
    
    navCtrl.fetchNav = function() {
        ApiRequest.get(ApiEndpoints.user.navbar, function(response) {
            navCtrl.navs = response.data.map(function(item) {
                if (item.children && item.children.length > 0) {
                    item.type = 'dropdown';
                    item.subItems = item.children.map(function(child) {
                        return {
                            title: child.title,
                            url: child.url
                        };
                    });
                } else {
                    item.type = 'single';
                }
                return item;
            });
        });
    };
    
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
                ApiRequest.post(ApiEndpoints.auth.logout, function(response) {
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
    
    navCtrl.init = function() {
        applyMode();
    };
    
    $state.go('user.dashboard');
    navCtrl.fetchNav();
    navCtrl.init();
}]);

app.controller('AcademicController', ['ApiRequest', 'ApiEndpoints',
    function(ApiRequest, ApiEndpoints) {
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
                                                    name: "Programming Fundamentals",
                                                    faculty: "Dr. Jane Smith"
                                                }
                                            ]
                                        },
                                        {
                                            name: "B",
                                            strength: 60,
                                            subjects: [
                                                {
                                                    name: "Programming Fundamentals",
                                                    faculty: "Dr. Bob Wil"
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
    }
]);

app.controller('sRegController', ['ApiRequest', 'ApiEndpoints',
function(ApiRequest, ApiEndpoints) {
    var regCtrl = this;
  
    regCtrl.register = function() {
        ApiRequest.post(ApiEndpoints.auth.register, {
            "email": regCtrl.email,
            "first_name": regCtrl.fname,
            "middle_name": regCtrl.mname,
            "last_name": regCtrl.lname,
            "password": regCtrl.pass1,
            "phone_number": regCtrl.number,
            "dob": regCtrl.dob,
            "gender": regCtrl.gender,
            "course": regCtrl.course,
            "department": regCtrl.dep,
            "detail": regCtrl.section,
            "address": regCtrl.address,
            "confirm_password": regCtrl.pass2
        }, function(response) {
            console.log(response);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message
            })
        });
    };

    regCtrl.detail = [{
        year: '',
        section:''
    }];
    
    regCtrl.addDetail = function() {
        regCtrl.detail.push({
            year: '',
            sec_sub_details: [{
                section: '',
                subject: ''
            }]
        });
    };
}]);

app.controller('AddController', ['ApiRequest', 'ApiEndpoints','$http',
    function(ApiRequest, ApiEndpoints,$http) {
        var addCtrl = this;
        addCtrl.courses=[];
        addCtrl.years=[];
        addCtrl.deps=[];
        addCtrl.subject = [];

        addCtrl.createCourse = function() {
            ApiRequest.post(ApiEndpoints.create.main, {
                "duration": parseInt(addCtrl.duration),
                "value": addCtrl.course
            }, function(response) {
                console.log(response);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                })
                addCtrl.fetchCourses();
                $('#addCourseModal').modal('hide')
            });
        };
      
        addCtrl.createDep = function() {
            ApiRequest.post(ApiEndpoints.create.main, {
                "pid": addCtrl.courseId,
                "value": addCtrl.dep
            }, function(response) {
                console.log(response);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                })
                $('#addDepartmentModal').modal('hide')
            });
        };

        addCtrl.createSection = function() {
            ApiRequest.post(ApiEndpoints.create.main, {
                "pid": addCtrl.dep,
                "value": addCtrl.section
            }, function(response) {
                console.log(response);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                })
                $('#addSectionModal').modal('hide')
            });
        };

        addCtrl.createSubjects = function() {
            ApiRequest.post(ApiEndpoints.create.main, {
                "pid": addCtrl.dep,
                "value": addCtrl.subject
            }, function(response) {
                console.log(response);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                })
                $('#addSubjectsModal').modal('hide')
            });
        };

        addCtrl.add = function() {
            addCtrl.subject.push({ 
                text: ''
            });
        };
    
        addCtrl.remove = function(index) {
            addCtrl.subject.splice(index, 1);
        };

        addCtrl.fetchCourses = function() {
            ApiRequest.get(ApiEndpoints.create.course, function(response) {
                console.log(response);
                addCtrl.courses = response.data
            });
        };

        addCtrl.fetchDeps = function(yearId) {
            if (!yearId) {
                yearId = addCtrl.year;
            }
            var req = {
                method: 'GET',
                url: `${BASE_URL}/portal/dropdowns/`,
                withCredentials: true,
                params: { 
                    "pid": yearId
                }       
            };
            $http(req).then(function(response) {
                console.log(response);
                addCtrl.deps = response.data;
            }, function(error) {
                console.log("Error", error);
            });
        };

        addCtrl.fetchYear = function(courseId) {
            if (!courseId) {
                courseId = addCtrl.course;
            }
            var req = {
                method: 'GET',
                url: `${BASE_URL}/portal/dropdowns/`,
                withCredentials: true,
                params: { 
                    "pid": courseId
                }       
            };
            $http(req).then(function(response) {
                console.log(response);
                addCtrl.years = response.data;
            }, function(error) {
                console.log("Error", error);
            });
        };

        addCtrl.fetchCourses()
}]);

app.controller('fRegController', ['ApiRequest', 'ApiEndpoints',
    function(ApiRequest, ApiEndpoints) {
        var fRegCtrl = this;
        
        fRegCtrl.showPassword = false;
        fRegCtrl.showConfirmPassword = false;
        
        fRegCtrl.togglePassword = function(inputId) {
            fRegCtrl.showPassword = !fRegCtrl.showPassword;
            var input = document.getElementById(inputId);
            input.type = fRegCtrl.showPassword ? 'text' : 'password';
        };
        fRegCtrl.toggleConfirmPassword = function(inputId) {
            fRegCtrl.showConfirmPassword = !fRegCtrl.showConfirmPassword;
            var input = document.getElementById(inputId);
            input.type = fRegCtrl.showConfirmPassword ? 'text' : 'password';
        };

        fRegCtrl.detail = [{
            year: '',
            subject: '',
            section:[]
        }];
        
        fRegCtrl.addDetail = function() {
            fRegCtrl.detail.push({
                year: '',
                subject: '',
                section: []
            });
        };
        
        fRegCtrl.removeDetail = function(index) {
            fRegCtrl.detail.splice(index, 1);
        };
        
        fRegCtrl.register = function() {
            ApiRequest.post(ApiEndpoints.auth.register, {
                "email": fRegCtrl.email,
                "first_name": fRegCtrl.fname,
                "middle_name": fRegCtrl.mname,
                "last_name": fRegCtrl.lname,
                "gender": fRegCtrl.gender,
                "password": fRegCtrl.pass1,
                "phone_number": fRegCtrl.number,
                "dob": fRegCtrl.dob,
                "course": fRegCtrl.course,
                "department": fRegCtrl.dep,
                "detail": fRegCtrl.detail,
                "address": fRegCtrl.address,
                "confirm_password": fRegCtrl.pass2
            }, function(response) {
                console.log(response);
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                })
            });
        };
}]);

app.controller('questionController', ['ApiRequest', 'ApiEndpoints', function(ApiRequest, ApiEndpoints) {
    var qpCtrl = this;
    
    qpCtrl.selectedYear = '';
    qpCtrl.selectedSubject = '';
    qpCtrl.questions = [];

    // qpCtrl.openQuestionModal = function() {
    //     qpCtrl.questions = [{ 
    //         text: '', 
    //         options: ['','','',''], 
    //         correctAnswer: '' 
    //     }];
        
    //     var questionModal = new bootstrap.Modal(document.getElementById('questionModal'));
    //     questionModal.show();
    // };

    qpCtrl.addQuestion = function() {
        qpCtrl.questions.push({ 
            text: '', 
            options: ['','','',''], 
            correctAnswer: '' 
        });
    };

    qpCtrl.remove = function(index) {
        qpCtrl.questions.splice(index, 1);
    };

    qpCtrl.saveQuestionPaper = function() {
        ApiRequest.post(ApiEndpoints.questionPaper.create, {
            "course": qpCtrl.selectedCourse,
            "dep": qpCtrl.selectedDep,
            "year": qpCtrl.selectedYear,
            "subject": qpCtrl.selectedSubject,
            "questions": qpCtrl.questions
        }, function(response) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message
            });
            $('questionModal').modal('hide')
            
            // var questionModal = bootstrap.Modal.getInstance(document.getElementById('questionModal'));
            // questionModal.hide();
        });
    };
}]);