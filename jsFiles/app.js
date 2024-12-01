const app = angular.module('app', ['ui.router', 'ui.bootstrap', 'app.services'])

const BASE_URL = 'https://10.21.97.202:8000';

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

    loginCtrl.passwordVisibility = {
        password: false,
        
        toggle: function(field) {
            this[field] = !this[field];
            var inputElement = document.getElementById(field);
            inputElement.type = this[field] ? 'text' : 'password';
        }
    };
}])

app.controller('dashController', ['$state', 'HttpService', 'ApiEndpoints', function($state, HttpService, ApiEndpoints) {
    var dashCtrl = this;
}])

app.controller('NavController', ['$state', 'HttpService', 'ApiEndpoints', function($state, HttpService, ApiEndpoints) {
    var navCtrl = this;
    
    navCtrl.currentMode = localStorage.getItem('appMode') || 'dark';

    navCtrl.init = function() {
        navCtrl.applyMode();
    };
    
    navCtrl.applyMode = function() {
        if (navCtrl.currentMode === 'dark') {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        }
        localStorage.setItem('appMode', navCtrl.currentMode);
    };
    
    navCtrl.toggleMode = function() {
        navCtrl.currentMode = navCtrl.currentMode === 'dark' ? 'light' : 'dark';
        navCtrl.applyMode();
    };
    
    navCtrl.fetchNav = function() {
        HttpService.get(ApiEndpoints.user.navbar)
            .then(function(response) {
                console.log(response.data[0].left_panel);
                navCtrl.navs = response.data[0].left_panel[0].map(function(item) {
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
    
    $state.go('user.dashboard');
    navCtrl.fetchNav();
    navCtrl.init();
}])

app.controller('sRegController', ['HttpService', 'ApiEndpoints',
function(HttpService, ApiEndpoints) {
    var regCtrl = this;

    regCtrl.courses=[];
    regCtrl.deps=[];
    regCtrl.years=[];
    regCtrl.genders=[];
    regCtrl.sections=[];

    regCtrl.fname = '';
    regCtrl.mname = '';
    regCtrl.lname = '';
    regCtrl.email = '';
    regCtrl.number = '';
    regCtrl.gender = '';
    regCtrl.dob = '';
    regCtrl.year = '';
    regCtrl.course = '';
    regCtrl.dep = '';
    regCtrl.password = '';
    regCtrl.confirmPassword = '';

    var currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() - 15);
    regCtrl.maxDateOfBirth = currentDate.toISOString().split('T')[0];

    regCtrl.register = function() {
        if (regCtrl.password !== regCtrl.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'Passwords do not match. Please try again.'
            });
            return;
        }
        var registrationData = {
            "type":student,
            "email": regCtrl.email,
            "first_name": regCtrl.fname,
            "middle_name": regCtrl.mname,
            "last_name": regCtrl.lname,
            "phone_number": regCtrl.number,
            "dob": regCtrl.dob,
            "gender": regCtrl.gender,
            "course": regCtrl.course,
            "department": regCtrl.dep,
            "detail": regCtrl.detail,
            "password": regCtrl.pass1,
            "confirm_password": regCtrl.pass2
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

    regCtrl.detail = [{
        year_id: parseInt(''),
        section: []
    }];

    regCtrl.passwordVisibility = {
        password: false,
        confirmPassword: false,
        
        toggle: function(field) {
            this[field] = !this[field];
            var inputElement = document.getElementById(field);
            inputElement.type = this[field] ? 'text' : 'password';
        }
    };

    regCtrl.fetchCourses = function() {
        HttpService.get(ApiEndpoints.create.course)
            .then(function(response) {
                regCtrl.courses = response.data;
            });
    };

    regCtrl.fetchGender = function() {
        HttpService.get(ApiEndpoints.user.gender)
            .then(function(response) {
                regCtrl.genders = response.data;
            });
    };

    regCtrl.fetchDeps = function(courseId) {
        if (!courseId) {
            courseId = regCtrl.course;
        }
        
        HttpService.get(ApiEndpoints.create.main + '?pid=' + courseId)
            .then(function(response) {
                console.log('Department Fetch Response:', response);
                regCtrl.deps = response.data;
            });
    };

    regCtrl.fetchYears = function(depId) {
        if (!depId) {
            depId = regCtrl.dep;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + depId)
            .then(function(response) {
                regCtrl.years = response.data;
                console.log(regCtrl.years);
            });
    };

    regCtrl.fetchSections = function(yearId) {
        if (!yearId) {
            yearId = detail.year;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + yearId)
            .then(function(response) {
                regCtrl.sections = response.data;
                console.log(regCtrl.sections);
            });
    };

    regCtrl.fetchCourses();
    regCtrl.fetchGender();
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

        addCtrl.fetchDeps = function(courseId) {
            if (!courseId) {
                courseId = addCtrl.course;
            }
            HttpService.get(ApiEndpoints.create.main + '?pid=' + courseId)
                .then(function(response) {
                    addCtrl.deps = response.data;
                    console.log(addCtrl.deps);
                })
                .catch(function(error) {
                    console.log("Error", error);
                });
        };
    
        addCtrl.fetchYears = function(depId) {
            if (!depId) {
                depId = addCtrlCtrl.dep;
            }
            HttpService.get(ApiEndpoints.create.main + '?pid=' + depId)
                .then(function(response) {
                    addCtrl.years = response;
                    console.log(addCtrl.years);
                })
                .catch(function(error) {
                    console.log("Error", error);
                });
        };

        addCtrl.fetchCourses();
}])

app.controller('fRegController', ['HttpService', 'ApiEndpoints',function(HttpService, ApiEndpoints) {
    var fRegCtrl = this;

    fRegCtrl.courses=[];
    fRegCtrl.deps=[];
    fRegCtrl.years=[];
    fRegCtrl.genders=[];
    fRegCtrl.subjects=[];
    fRegCtrl.sections=[];

    fRegCtrl.fname = '';
    fRegCtrl.mname = '';
    fRegCtrl.lname = '';
    fRegCtrl.email = '';
    fRegCtrl.number = '';
    fRegCtrl.gender = '';
    fRegCtrl.dob = '';
    fRegCtrl.course = '';
    fRegCtrl.dep = '';
    fRegCtrl.password = '';
    fRegCtrl.confirmPassword = '';

    fRegCtrl.passwordVisibility = {
        password: false,
        confirmPassword: false,
        
        toggle: function(field) {
            this[field] = !this[field];
            var inputElement = document.getElementById(field);
            inputElement.type = this[field] ? 'text' : 'password';
        }
    };

    fRegCtrl.teachingDetails = [{
        year_id: parseInt(''),
        subject_id: parseInt(''),
        section: []
    }];

    fRegCtrl.addTeachingDetail = function() {
        fRegCtrl.teachingDetails.push({
            year_id: parseInt(''),
            subject_id: parseInt(''),
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
        
        HttpService.get(ApiEndpoints.create.main + '?pid=' + courseId)
            .then(function(response) {
                console.log('Department Fetch Response:', response);
                fRegCtrl.deps = response.data;
            });
    };

    fRegCtrl.fetchYears = function(depId) {
        if (!depId) {
            depId = fRegCtrl.dep;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + depId)
            .then(function(response) {
                fRegCtrl.years = response.data;
                console.log(fRegCtrl.years);
            });
    };

    fRegCtrl.fetchSections = function(yearId) {
        if (!yearId) {
            yearId = detail.year;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + yearId)
            .then(function(response) {
                fRegCtrl.sections = response.data;
                console.log(fRegCtrl.sections);
            });
    };

    fRegCtrl.fetchSubjects = function(secId) {
        if (!secId) {
            secId = detail.section;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + secId)
            .then(function(response) {
                fRegCtrl.subjects = response.data;
                console.log(fRegCtrl.subjects);
            })
            .catch(function(error) {
                console.log("Error", error);
            });
    };

    // fRegCtrl.fetchCourses();
    // fRegCtrl.fetchGender();
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
    
    qpCtrl.addOption = function(questionIndex) {
        if (qpCtrl.questions[questionIndex].options.length < 6) {
            qpCtrl.questions[questionIndex].options.push('');
        }
    };
    
    qpCtrl.removeOption = function(questionIndex, optionIndex) {
        if (qpCtrl.questions[questionIndex].options.length > 2) {
            qpCtrl.questions[questionIndex].options.splice(optionIndex, 1);
            
            if (qpCtrl.questions[questionIndex].correctAnswer === optionIndex) {
                qpCtrl.questions[questionIndex].correctAnswer = '';
            } else if (qpCtrl.questions[questionIndex].correctAnswer > optionIndex) {
                qpCtrl.questions[questionIndex].correctAnswer--;
            }
        }
    };
    
    qpCtrl.remove = function(index) {
        qpCtrl.questions.splice(index, 1);
    };
    
    qpCtrl.saveQuestionPaper = function() {
        var data = {
            course: qpCtrl.selectedCourse,
            department: qpCtrl.selectedDepartment,
            year: qpCtrl.selectedYear,
            subject: qpCtrl.selectedSubject,
            questions: qpCtrl.questions
        };
        
        console.log(JSON.stringify(data, null, 2));
        
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