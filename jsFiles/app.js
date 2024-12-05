const app = angular.module('app', ['ui.router', 'ui.bootstrap', 'app.services'])

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
            url: '/facultyRecords',
            templateUrl: 'templateFiles/faculty.html',
            controller: 'facultyController',
            controllerAs: 'facCtrl'
        })
        .state('user.makePaper', {
            url: '/makeExam',
            templateUrl: 'templateFiles/makePaper.html',
            controller: 'questionController',
            controllerAs: 'qpCtrl'
        })
        .state('user.course', {
            url: '/courseRecords',
            templateUrl: 'templateFiles/courses.html',
            controller: 'courseController',
            controllerAs: 'coCtrl'
        })
        .state('user.studentRec', {
            url: '/studentRecords',
            templateUrl: 'templateFiles/students.html',
            controller: 'studentController',
            controllerAs: 'studentCtrl'
        })
        .state('user.schedule', {
            url: '/schedule',
            templateUrl: 'templateFiles/makeSchedule.html',
            controller: 'makeController',
            controllerAs: 'makeCtrl'
        })
        .state('user.exam', {
            url: '/exam',
            templateUrl: 'templateFiles/exam.html',
            controller: 'examController',
            controllerAs: 'examCtrl'
        })
        .state('user.viewSchedule', {
            url: '/viewSchedule',
            templateUrl: 'templateFiles/viewSchedule.html',
            controller: 'scheduleController',
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

app.controller('dashController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var dashCtrl = this;

    dashCtrl.fetchDashboard = function() {
        HttpService.get(ApiEndpoints.user.dashboard)
            .then(function(response) {
                dashCtrl.dashboard = response.data;
            });
    };

    dashCtrl.fetchDashboard();
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
        var formattedDate = '';
        if (regCtrl.dob) {
            var dateObj = new Date(regCtrl.dob);
            formattedDate = dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        var registrationData = {
            "type":"student",
            "email": regCtrl.email,
            "first_name": regCtrl.fname,
            "middle_name": regCtrl.mname,
            "last_name": regCtrl.lname,
            "phone_number": regCtrl.number,
            "dob": formattedDate,
            "gender_id": regCtrl.gender,
            "course_id": regCtrl.course,
            "department_id": regCtrl.dep,
            "detail": regCtrl.detail,
            "password": regCtrl.password,
            "confirm_password": regCtrl.confirmPassword
        };
        HttpService.post(ApiEndpoints.auth.register, registrationData)
            .then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Successful!',
                    text: response.message || 'Account has been created.'
                });
            });
    };

    regCtrl.detail = [{
        year: parseInt(''),
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
            });
    };

    regCtrl.fetchSections = function(yearId) {
        if (!yearId) {
            yearId = detail.year;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + yearId)
            .then(function(response) {
                regCtrl.sections = response.sections;
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
                addCtrl.course = '';
                addCtrl.duration = '';
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
                addCtrl.dep = '';
                addCtrl.courseId = '';
            });
        };

        addCtrl.createSection = function() {
        
            HttpService.post(ApiEndpoints.create.main, {
                "pid": addCtrl.year,
                "value": addCtrl.sectionName
            }).then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                });
                $('#addSectionModal').modal('hide');
                addCtrl.sectionName = '';
                addCtrl.dep = '';
                addCtrl.year = '';
                addCtrl.course = '';
            });
        };

        addCtrl.createSubjects = function() {
            var subjects = addCtrl.subjects.map(function(subject) {
                return subject.text;
            });
        
            HttpService.post(ApiEndpoints.create.main, {
                "pid": addCtrl.year,
                "value": subjects
            }).then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                });
                $('#addSubjectsModal').modal('hide');
                addCtrl.subjects = [{ text: '' }];
                addCtrl.dep = '';
                addCtrl.year = '';
                addCtrl.course = '';
            });
        };

        addCtrl.createExam = function() {

            HttpService.post(ApiEndpoints.exam.type, {
                "exam_name": addCtrl.exam,
                "maximum_marks": addCtrl.marks,
                "exam_duration": parseInt(addCtrl.duration)
            }).then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                });
                $('#addExamModal').modal('hide');
                addCtrl.exam = '';
                addCtrl.marks = '';
                addCtrl.duration = '';
            });
        };

        addCtrl.createGender = function() {

            HttpService.post(ApiEndpoints.user.gender, {
                "gender": addCtrl.gender
            }).then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.message
                });
                $('#addGenderModal').modal('hide');
                addCtrl.gender = '';
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
                });
        };
    
        addCtrl.fetchYears = function(depId) {
            if (!depId) {
                depId = addCtrl.dep;
            }
            HttpService.get(ApiEndpoints.create.main + '?pid=' + depId)
                .then(function(response) {
                    addCtrl.years = response.data;
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
        year: parseInt(''),
        subject: parseInt(''),
        section: []
    }];

    fRegCtrl.addTeachingDetail = function() {
        fRegCtrl.teachingDetails.push({
            year: parseInt(''),
            subject: parseInt(''),
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

        var formattedDate = '';
        if (fRegCtrl.dob) {
            var dateObj = new Date(fRegCtrl.dob);
            formattedDate = dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    
        var registrationData = {
            "type":"faculty",
            "email": fRegCtrl.email,
            "first_name": fRegCtrl.fname,
            "middle_name": fRegCtrl.mname,
            "last_name": fRegCtrl.lname,
            "phone_number": fRegCtrl.number,
            "dob": formattedDate, 
            "gender_id": fRegCtrl.gender,
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
                    title: 'Successful!',
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
            });
    };

    fRegCtrl.fetchSections = function(yearId) {
        if (!yearId) {
            yearId = detail.year;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + yearId)
            .then(function(response) {
                fRegCtrl.sections = response.sections;
                fRegCtrl.subjects = response.subjects;
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

app.controller('studentController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var studentCtrl = this;

    studentCtrl.fetchDetails = function() {
        HttpService.get(ApiEndpoints.user.records + '?choice=' + "student")
            .then(function(response) {
                studentCtrl.students = response.data;
            });
    };

    // studentCtrl.editCourse = function(course) {
    //     alert('Editing course: ' + course.name);
    // };

    // studentCtrl.deleteCourse = function(course) {
    //     var index = academicCtrl.academicData.courses.indexOf(course);
    //     if (index > -1) {
    //         academicCtrl.academicData.courses.splice(index, 1);
    //     }
    // };

    studentCtrl.fetchDetails();
}]);

app.controller('facultyController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var facCtrl = this;

    facCtrl.fetchDetails = function() {
        HttpService.get(ApiEndpoints.user.records + '?choice=' + "faculty")
            .then(function(response) {
                facCtrl.facs = response.data[1].faculty;
            });
    };

    // facCtrl.editCourse = function(course) {
    //     alert('Editing course: ' + course.name);
    // };

    // facCtrl.deleteCourse = function(course) {
    //     var index = academicCtrl.academicData.courses.indexOf(course);
    //     if (index > -1) {
    //         academicCtrl.academicData.courses.splice(index, 1);
    //     }
    // };

    facCtrl.fetchDetails();
}]);

app.controller('courseController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var coCtrl = this;

    coCtrl.fetchDetails = function() {
        HttpService.get(ApiEndpoints.user.records + '?choice=' + "courses")
            .then(function(response) {
                coCtrl.courses = response.data;
                coCtrl.deps= response.data.departments;
            });
    };

    // coCtrl.editCourse = function(course) {
    //     alert('Editing course: ' + course.name);
    // };

    // coCtrl.deleteCourse = function(course) {
    //     var index = academicCtrl.academicData.courses.indexOf(course);
    //     if (index > -1) {
    //         academicCtrl.academicData.courses.splice(index, 1);
    //     }
    // };

    coCtrl.fetchDetails();
}]);

app.controller('makeController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var makeCtrl = this;

    makeCtrl.course = '';
    makeCtrl.department = '';
    makeCtrl.year = '';
    makeCtrl.exam = '';
    makeCtrl.subjects = [];

    makeCtrl.formatTime = function(time) {
        if (!time) return null;
        const timeObj = new Date(`1970-01-01T${time}`);
        
        return `${
            timeObj.getHours().padStart(2, '0')
        }:${
            timeObj.getMinutes().padStart(2, '0')
        }:${
            timeObj.getSeconds().padStart(2, '0')
        }`;
    };

    makeCtrl.validateDate = function() {
        return makeCtrl.subjects.every(subject => {
            const isValid = subject.end_time > subject.start_time;
            
            if (!isValid) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Time',
                    text: 'End time must be after start time'
                });
            }
            
            return isValid;
        });
    };

    makeCtrl.openScheduleModal = function() {
        if (makeCtrl.subjects.length === 0) {
            makeCtrl.addSubjects();
        }
    };

    makeCtrl.addSubjects = function() {
        makeCtrl.subjects.push({
            subject: '',
            date: '',
            start_time: '',
            end_time: ''
        });
    };

    makeCtrl.remove = function(index) {
        makeCtrl.subjects.splice(index, 1);
    };

    makeCtrl.saveSchedule = function() {
        // if (!makeCtrl.validateDate()) {
        //     return;
        // }
        var data = {
            course_id: makeCtrl.course,
            department_id: makeCtrl.department,
            year_id: makeCtrl.year,
            exam_type: makeCtrl.exam,
            exam_details: makeCtrl.subjects.map(subject => ({
                subject: subject.subject,
                date: subject.date,
                start_time: makeCtrl.formatTime(subject.start_time),
                end_time: makeCtrl.formatTime(subject.end_time)
            }))
        };

        HttpService.post(ApiEndpoints.exam.makeSchedule, data)
            .then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Successful!',
                    text: response.message || 'Schedule Submitted Successfully!'
                });
                makeCtrl.subjects = [];
            });
    };

    makeCtrl.fetchExams = function() {
        HttpService.get(ApiEndpoints.exam.type)
            .then(function(response) {
                makeCtrl.exams = response.data;
            });
    };

    makeCtrl.fetchCourses = function() {
        HttpService.get(ApiEndpoints.create.course)
            .then(function(response) {
                makeCtrl.courses = response.data;
            });
    };

    makeCtrl.fetchDeps = function(courseId) {
        if (!courseId) {
            courseId = makeCtrl.course;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + courseId)
            .then(function(response) {
                makeCtrl.deps = response.data;
            });
    };

    makeCtrl.fetchYears = function(depId) {
        if (!depId) {
            depId = makeCtrl.dep;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + depId)
            .then(function(response) {
                makeCtrl.years = response.data;
            });
    };

    makeCtrl.fetchSubjects = function(yearId) {
        if (!yearId) {
            yearId = makeCtrl.year;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + yearId)
            .then(function(response) {
                makeCtrl.subjects = response.subjects;
            });
    };

    makeCtrl.fetchCourses();
    makeCtrl.fetchExams();
}]);

app.controller('scheduleController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var schedCtrl = this;

    // schedCtrl.fetchSchedule = function() {
    //     var params = {
    //         exam_id: schedCtrl.exam,
    //         course_id:schedCtrl.course,
    //         department_id: schedCtrl.department,
    //         year_id: schedCtrl.year
    //     }

    //     HttpService.get(ApiEndpoints.exam.makeSchedule, params)
    //         .then(function(response) {
    //             schedCtrl.schedules = response.data;
    //         });
    // };

    schedCtrl.fetchSchedule = function() {
        HttpService.get(ApiEndpoints.exam.makeSchedule + '?exam_id=' + schedCtrl.exam + "&" + 'course_id='+ schedCtrl.course+'&'+ 'department_id=' + schedCtrl.dep + "&" + 'year_id=' + schedCtrl.year)
            .then(function(response) {
                schedCtrl.schedules = response.data;
            });
    };

    schedCtrl.fetchExams = function() {
        HttpService.get(ApiEndpoints.exam.type)
            .then(function(response) {
                schedCtrl.exams = response.data;
            });
    };

    schedCtrl.fetchCourses = function() {
        HttpService.get(ApiEndpoints.create.course)
            .then(function(response) {
                schedCtrl.courses = response.data;
            });
    };

    schedCtrl.fetchDeps = function(courseId) {
        if (!courseId) {
            courseId = schedCtrl.course;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + courseId)
            .then(function(response) {
                schedCtrl.deps = response.data;
            });
    };

    schedCtrl.fetchYears = function(depId) {
        if (!depId) {
            depId = schedCtrl.dep;
        }
        HttpService.get(ApiEndpoints.create.main + '?pid=' + depId)
            .then(function(response) {
                schedCtrl.years = response.data;
            });
    };

    schedCtrl.fetchExams();
    schedCtrl.fetchCourses();
}]);

app.controller('examController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var examCtrl = this;
    examCtrl.currentQuestionIndex = 0;
    examCtrl.selectedAnswer = null;
    examCtrl.examCompleted = false;
    examCtrl.score = 0;
    examCtrl.timeRemaining = '30:00';
    examCtrl.currentSubject = 'Computer Science';

    // examCtrl.fetchQuestions = function() {
    //     $http.get('/api/questions')
    //         .then(function(response) {
    //             examCtrl.questions = response.data;
    //             examCtrl.totalQuestions = examCtrl.questions.length;
    //             examCtrl.currentQuestion = examCtrl.questions[examCtrl.currentQuestionIndex];
    //         })
    //             examCtrl.totalQuestions = examCtrl.questions.length;
    //         };
    // };

    examCtrl.submitExam = function() {
        examCtrl.examResults.questions = examCtrl.questions.map(function(question) {
            return {
                questionId: question.id,
                selectedOption: question.selectedAnswer,
                isCorrect: question.selectedAnswer
            };
        });
        $http.post('/api/exam/submit', examCtrl.examResults)
            .then(function(response) {
                examCtrl.examCompleted = true;
                examCtrl.submissionResult = response.data;
                examCtrl.resultMessage = response.data.message;
            });
    };

    examCtrl.startTimer = function() {
        var totalSeconds = 30 * 60;
        var timer = $interval(function() {
            totalSeconds--;
            var minutes = Math.floor(totalSeconds / 60);
            var seconds = totalSeconds % 60;
            examCtrl.timeRemaining = 
                (minutes < 10 ? '0' : '') + minutes + ':' + 
                (seconds < 10 ? '0' : '') + seconds;
            
            if (totalSeconds <= 0) {
                $interval.cancel(timer);
                examCtrl.submitExam();
            }
        }, 1000);
    };

    examCtrl.nextQuestion = function() {
        if (examCtrl.currentQuestionIndex + 1 < examCtrl.totalQuestions) {
            examCtrl.currentQuestionIndex++;
            examCtrl.currentQuestion = examCtrl.questions[examCtrl.currentQuestionIndex];
            examCtrl.selectedAnswer = null;
        } else {
            examCtrl.submitExam();
        }
    };

    examCtrl.previousQuestion = function() {
        if (examCtrl.currentQuestionIndex > 0) {
            examCtrl.currentQuestionIndex--;
            examCtrl.currentQuestion = examCtrl.questions[examCtrl.currentQuestionIndex];
        }
    };
    
    examCtrl.fetchQuestions();
    examCtrl.startTimer();
}]);