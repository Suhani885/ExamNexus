const app = angular.module('app', ['ui.router', 'ui.bootstrap', 'app.services'])

const BASE_URL = 'https://10.21.97.242:8000';

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
            controller: 'dashController',
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

app.controller('LoginController', ['$state', 'HttpService', 'ApiEndpoints', function($state, HttpService, ApiEndpoints) {
    var loginCtrl = this;
    loginCtrl.email = '';
    loginCtrl.password = '';
    
    loginCtrl.login = function() {
        var loginData = {
            "email": loginCtrl.email,
            "password": loginCtrl.password
        };
  
        HttpService.post(ApiEndpoints.auth.login, loginData)
            .then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message || 'Login successful'
                }).then(() => {
                    $state.go('user');
                });
            });
    };
}])

app.controller('dashController', ['$state', 'HttpService', 'ApiEndpoints', function($state, HttpService, ApiEndpoints) {
    var dashCtrl = this;
}])

app.controller('NavController', ['$state', 'HttpService', 'ApiEndpoints', function($state, HttpService, ApiEndpoints) {
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
        HttpService.get(ApiEndpoints.user.navbar)
            .then(function(response) {
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
                HttpService.post(ApiEndpoints.auth.logout, {})
                    .then(function(response) {
                        localStorage.removeItem('userToken');
                        sessionStorage.clear();
                        Swal.fire(
                            'Logged Out!',
                            response.message || 'You have been successfully logged out.',
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
}])

app.controller('sRegController', ['HttpService', 'ApiEndpoints',
function(HttpService, ApiEndpoints) {
    var regCtrl = this;
  
    regCtrl.register = function() {
        HttpService.post(ApiEndpoints.auth.register, {
            "type":student,
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
        }).then(function(response) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message
            });
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
}])

app.controller('AddController', ['HttpService', 'ApiEndpoints', '$http',function(HttpService, ApiEndpoints, $http) {
        var addCtrl = this;
        addCtrl.courses = [];
        addCtrl.years = [];
        addCtrl.deps = [];

        addCtrl.createCourse = function() {
            HttpService.post(ApiEndpoints.create.main, {
                "duration": parseInt(addCtrl.duration),
                "value": addCtrl.course
            }).then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                });
                addCtrl.fetchCourses();
                $('#addCourseModal').modal('hide');
            });
        };
      
        addCtrl.createDep = function() {
            HttpService.post(ApiEndpoints.create.main, {
                "pid": addCtrl.courseId,
                "value": addCtrl.dep
            }).then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                });
                $('#addDepartmentModal').modal('hide');
            });
        };

        addCtrl.createSection = function() {
            if (!addCtrl.depForSection || !addCtrl.sectionName) {
                Swal.fire({
                    icon: 'error',
                    title: 'Incomplete Information',
                    text: 'Please select a department and enter a section name'
                });
                return;
            }
        
            HttpService.post(ApiEndpoints.create.main, {
                "pid": addCtrl.depForSection,
                "value": addCtrl.sectionName
            }).then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                });
                $('#addSectionModal').modal('hide');
                addCtrl.sectionName = '';
                addCtrl.depForSection = '';
                addCtrl.yearForSection = '';
                addCtrl.courseForSection = '';
            });
        };

        addCtrl.createSubjects = function() {
            // if (!addCtrl.depForSubjects || addCtrl.subjects.some(s => !s.text.trim())) {
            //     Swal.fire({
            //         icon: 'error',
            //         title: 'Incomplete Information',
            //         text: 'Please select a department and fill in all subject names'
            //     });
            //     return;
            // }
            // var subjectsData = addCtrl.subjects.map(s => s.text.trim()).filter(s => s);
        
            HttpService.post(ApiEndpoints.create.main, {
                "pid": addCtrl.depForSubjects,
                "value": subjectsData
            }).then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                });
                $('#addSubjectsModal').modal('hide');
                addCtrl.subjects = [{ text: '' }];
                addCtrl.depForSubjects = '';
                addCtrl.yearForSubjects = '';
                addCtrl.courseForSubjects = '';
            });
        };

        addCtrl.subjects = [{ text: '' }];

        addCtrl.addSubject = function() {
            addCtrl.subjects.push({ text: '' });
        };

        addCtrl.removeSubject = function(index) {
            if (addCtrl.subjects.length > 1) {
                addCtrl.subjects.splice(index, 1);
            }
        };

        addCtrl.fetchCourses = function() {
            HttpService.get(ApiEndpoints.create.course)
                .then(function(response) {
                    addCtrl.courses = response.data;
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
                addCtrl.years = response.data;
                console.log(addCtrl.years);
            }, function(error) {
                console.log("Error", error);
            });
        };

        addCtrl.fetchCourses();
}])

app.controller('fRegController', ['HttpService', 'ApiEndpoints','$http', function(HttpService, ApiEndpoints,$http) {
    var fRegCtrl = this;
    fRegCtrl.courses=[];
    fRegCtrl.deps=[];
    fRegCtrl.years=[];
    fRegCtrl.genders=[];
    fRegCtrl.subjects=[];
    fRegCtrl.sections=[];
    fRegCtrl.firstName = '';
    fRegCtrl.middleName = '';
    fRegCtrl.lastName = '';
    fRegCtrl.email = '';
    fRegCtrl.phoneNumber = '';
    fRegCtrl.dateOfBirth = '';
    fRegCtrl.course = '';
    fRegCtrl.department = '';
    fRegCtrl.password = '';
    fRegCtrl.confirmPassword = '';

    fRegCtrl.passwordVisibility = {
        password: false,
        confirmPassword: false,
    
        toggle: function(inputId) {
            var inputElement = document.getElementById(inputId);
            var visibilityFlag = inputId + 'Visibility';
            if (inputElement.type === 'password') {
                inputElement.type = 'text';
                this[visibilityFlag] = true;
            } else {
                inputElement.type = 'password';
                this[visibilityFlag] = false;
            }
        }
    };

    fRegCtrl.teachingDetails = [{
        year_id: '',
        subject_id: '',
        sections: []
    }];

    fRegCtrl.addTeachingDetail = function() {
        fRegCtrl.teachingDetails.push({
            year_id: '',
            subject_id: '',
            section: []
        });
    };
    fRegCtrl.removeTeachingDetail = function(index) {
        if (fRegCtrl.teachingDetails.length > 1) {
            fRegCtrl.teachingDetails.splice(index, 1);
        }
    };

    var currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() - 21);
    fRegCtrl.maxDateOfBirth = currentDate.toISOString().split('T')[0];

    fRegCtrl.registerFaculty = function() {
        if (fRegCtrl.password !== fRegCtrl.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'Passwords do not match. Please try again.'
            });
            return;
        }
        var registrationData = {
            "type":faculty,
            "email": fRegCtrl.email,
            "first_name": fRegCtrl.fname,
            "middle_name": fRegCtrl.mname,
            "last_name": fRegCtrl.lname,
            "phone_number": fRegCtrl.number,
            "dob": fRegCtrl.dob,
            "gender":fRegCtrl.gender,
            "course_id": fRegCtrl.course,
            "department_id": fRegCtrl.dep,
            "password": fRegCtrl.password,
            "confirm_password": fRegCtrl.confirmPassword,
            "detail": fRegCtrl.teachingDetails
        };
        HttpService.post(ApiEndpoints.auth.register, registrationData)
            .then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful!',
                    text: response.message || 'Account has been created.'
                });
            });
    };

    fRegCtrl.fetchCourses = function() {
        HttpService.get(ApiEndpoints.create.course)
            .then(function(response) {
                fRegCtrl.courses = response.data;
            });
    };

    fRegCtrl.fetchGender = function() {
        HttpService.get(ApiEndpoints.user.gender)
            .then(function(response) {
                fRegCtrl.genders = response.data;
            });
    };

    fRegCtrl.fetchDeps = function(courseId) {
        if (!courseId) {
            courseId = fRegCtrl.course;
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
            fRegCtrl.deps = response.data;
            console.log(fRegCtrl.deps);
        }, function(error) {
            console.log("Error", error);
        });
    };

    fRegCtrl.fetchYears = function(depId) {
        if (!depId) {
            depId = fRegCtrl.dep;
        }
        var req = {
            method: 'GET',
            url: `${BASE_URL}/portal/dropdowns/`,
            withCredentials: true,
            params: { 
                "pid": depId
            }       
        };
        $http(req).then(function(response) {
            fRegCtrl.years = response.data;
            console.log(fRegCtrl.years);
        }, function(error) {
            console.log("Error", error);
        });
    };

    fRegCtrl.fetchSections = function(yearId) {
        if (!yearId) {
            yearId = fRegCtrl.year;
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
            fRegCtrl.sections = response.data;
            console.log(fRegCtrl.sections);
        }, function(error) {
            console.log("Error", error);
        });
    };

    fRegCtrl.fetchSubjects = function(secId) {
        if (!secId) {
            secId = fRegCtrl.sec;
        }
        var req = {
            method: 'GET',
            url: `${BASE_URL}/portal/dropdowns/`,
            withCredentials: true,
            params: { 
                "pid": secId
            }       
        };
        $http(req).then(function(response) {
            fRegCtrl.subjects = response.data;
            console.log(fRegCtrl.subjects);
        }, function(error) {
            console.log("Error", error);
        });
    };

    fRegCtrl.fetchCourses();
    fRegCtrl.fetchGender();
}]);

    app.controller('questionController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var qpCtrl = this;
    
    qpCtrl.selectedCourse = '';
    qpCtrl.selectedDepartment = '';
    qpCtrl.selectedYear = '';
    qpCtrl.selectedSubject = '';
    qpCtrl.questions = [];

    qpCtrl.openQuestionModal = function() {
        if (qpCtrl.questions.length === 0) {
            qpCtrl.addQuestion();
        }
    };

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

    // qpCtrl.validateQuestionPaper = function() {
    //     if (!qpCtrl.selectedCourse || !qpCtrl.selectedDepartment || 
    //         !qpCtrl.selectedYear || !qpCtrl.selectedSubject) {
    //         alert('Please complete all selections before submitting.');
    //         return false;
    //     }

    //     for (var i = 0; i < qpCtrl.questions.length; i++) {
    //         var q = qpCtrl.questions[i];
    //         if (!q.text) {
    //             alert('Question text is required for all questions.');
    //             return false;
    //         }
    //         if (q.options.some(opt => !opt)) {
    //             alert('All options must be filled for each question.');
    //             return false;
    //         }
    //         if (q.correctAnswer === '') {
    //             alert('Please select a correct answer for all questions.');
    //             return false;
    //         }
    //     }
    //     return true;
    // };

    qpCtrl.saveQuestionPaper = function() {
        // if (!qpCtrl.validateQuestionPaper()) {
        //     return;
        // }
        var data = {
            course: qpCtrl.selectedCourse,
            department: qpCtrl.selectedDepartment,
            year: qpCtrl.selectedYear,
            subject: qpCtrl.selectedSubject,
            questions: qpCtrl.questions
        };
        console.log(data);
        HttpService.post(ApiEndpoints.auth.save, data)
            .then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Successful!',
                    text: response.message || 'Question Paper Submitted Successfully!'
                });
            });
    };
}]);

app.controller('academicController', function($http) {
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

    academicCtrl.fetchCourses = function() {
        $http.get('/api/courses')
        .then(function(response) {
            academicCtrl.academicData.courses = response.data;
        })
        .catch(function(error) {
            console.error('Error fetching courses:', error);
        });
    };

    academicCtrl.editCourse = function(course) {
        alert('Editing course: ' + course.name);
    };

    academicCtrl.deleteCourse = function(course) {
        var index = academicCtrl.academicData.courses.indexOf(course);
        if (index > -1) {
            academicCtrl.academicData.courses.splice(index, 1);
        }
    };
    academicCtrl.fetchCourses();
});