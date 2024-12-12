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
        .state('user.giveExam', {
            url: '/giveExam',
            templateUrl: 'templateFiles/exam.html',
            controller: 'ExamController',
            controllerAs: 'examCtrl'
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
        .state('user.scores', {
            url: '/scores',
            templateUrl: 'templateFiles/scores.html',
            controller: 'scoreController',
            controllerAs: 'scoreCtrl'
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
            controller: 'ExamController',
            controllerAs: 'examCtrl'
        })
        .state('user.selectPaper', {
            url: '/selectPaper',
            templateUrl: 'templateFiles/select.html',
            controller: 'hodPaperController',
            controllerAs: 'hodCtrl'
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

app.controller('dashController', ['HttpService', 'ApiEndpoints', '$timeout', function(HttpService, ApiEndpoints, $timeout) {
    var dashCtrl = this;

    dashCtrl.fetchDashboard = function() {
        HttpService.get(ApiEndpoints.user.dashboard)
            .then(function(response) {
                dashCtrl.dashboard = response.data;
                dashCtrl.role = response.roles;
                $timeout(function() {
                    if (google && google.charts) {
                        google.charts.load('current', {'packages':['corechart']});
                        google.charts.setOnLoadCallback(dashCtrl.drawDonutChart);
                    }
                });
            });
    };
    
    dashCtrl.fetchProfile = function() {
        HttpService.get(ApiEndpoints.user.profile)
            .then(function(response) {
                dashCtrl.profile = response.data;
            });
    };

    dashCtrl.drawDonutChart = function() {
        if (!dashCtrl.dashboard || dashCtrl.dashboard.length === 0) return;

        var students = dashCtrl.dashboard[0].students || 0;
        var courses = dashCtrl.dashboard[0].courses || 0;
        var employees = dashCtrl.dashboard[0].employees || 0;

        var data = google.visualization.arrayToDataTable([
            ['Category', 'Count'],
            ['Students', students],
            ['Courses', courses],
            ['Employees', employees]
        ]);

        var options = {
            title: 'Organizational Data',
            pieHole: 0.4,
            backgroundColor: 'transparent',
            titleTextStyle: { color: '#ffffff' },
            legendTextStyle: { color: '#ffffff' },
            colors: ['#10e442', '#ffc107', '#356fdc'],
            pieSliceTextStyle: { color: 'white' }
        };

        var chart = new google.visualization.PieChart(document.getElementById('donut_chart'));
        chart.draw(data, options);
    };

    // dashCtrl.fetchDashboard();
    // dashCtrl.fetchProfile();
}]);

app.controller('NavController', ['$state', 'HttpService', 'ApiEndpoints', function($state, HttpService, ApiEndpoints) {
    var navCtrl = this;
    
    navCtrl.currentMode = localStorage.getItem('appMode') || 'dark';
    
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
    
    // $state.go('user.dashboard');
    // navCtrl.fetchNav();
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
        var params = {
            pid: courseId
        }
        HttpService.get(ApiEndpoints.create.main,params)
            .then(function(response) {
                console.log('Department Fetch Response:', response);
                regCtrl.deps = response.data;
            });
    };

    regCtrl.fetchYears = function(depId) {
        if (!depId) {
            depId = regCtrl.dep;
        }
        var params = {
            pid: depId
        }
        HttpService.get(ApiEndpoints.create.main,params)
            .then(function(response) {
                regCtrl.years = response.data;
            });
    };

    regCtrl.fetchSections = function(yearId) {
        if (!yearId) {
            yearId = detail.year;
        }
        var params = {
            pid: yearId
        }
        HttpService.get(ApiEndpoints.create.main,params)
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
                "questions": addCtrl.ques,
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
                addCtrl.ques='';
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
            var params = {
                pid: courseId
            }
            HttpService.get(ApiEndpoints.create.main,params)
                .then(function(response) {
                    addCtrl.deps = response.data;
                });
        };
    
        addCtrl.fetchYears = function(depId) {
            if (!depId) {
                depId = addCtrl.dep;
            }
            var params = {
                pid: depId
            }
            HttpService.get(ApiEndpoints.create.main,params)
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
                detail.year='';
                detail.subject='';
                detail.section='';

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
        var params = {
            pid: courseId
        }
        HttpService.get(ApiEndpoints.create.main, params)
            .then(function(response) {
                console.log('Department Fetch Response:', response);
                fRegCtrl.deps = response.data;
            });
    };

    fRegCtrl.fetchYears = function(depId) {
        if (!depId) {
            depId = fRegCtrl.dep;
        }
        var params = {
            pid: depId
        }
        HttpService.get(ApiEndpoints.create.main,params)
            .then(function(response) {
                fRegCtrl.years = response.data;
            });
    };

    fRegCtrl.fetchSections = function(yearId) {
        if (!yearId) {
            yearId = detail.year;
        }
        var params = {
            pid: yearId
        }
        HttpService.get(ApiEndpoints.create.main,params)
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
    
    qpCtrl.details = [];
    qpCtrl.questions = [];
    qpCtrl.selectedExam = null;

    qpCtrl.openQuestionModal = function(exam) {
        qpCtrl.selectedExam = exam;
        qpCtrl.questions = []; 
        qpCtrl.addQuestion(); 
        $('#questionModal').modal('show');
    };
    
    qpCtrl.addQuestion = function() {
        qpCtrl.questions.push({
            questionText: '',
            options: ['', '', '', ''], 
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
            
            if (qpCtrl.questions[questionIndex].correctAnswer === qpCtrl.questions[questionIndex].options[optionIndex]) {
                qpCtrl.questions[questionIndex].correctAnswer = '';
            }
        }
    };
    
    qpCtrl.remove = function(index) {
        qpCtrl.questions.splice(index, 1);
    };

    qpCtrl.fetchDetails = function() {
        HttpService.get(ApiEndpoints.create.paper)
            .then(function(response) {
                qpCtrl.details = response.data;
            });
    };
    
    qpCtrl.saveQuestionPaper = function() {
        var data = {
            year_id: qpCtrl.selectedExam.year_id,
            subject_id: qpCtrl.selectedExam.subject_id,
            schedule_id:qpCtrl.selectedExam.schedule_id,
            questions: qpCtrl.questions
        };
        
        HttpService.post(ApiEndpoints.create.exam, data)
            .then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Successful!',
                    text: response.message || 'Question Paper Submitted Successfully!'
                });
                
                $('#questionModal').modal('hide');
                qpCtrl.questions = [];
            });
    };

    qpCtrl.fetchDetails();
}]);

app.controller('studentController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var studentCtrl = this;
    studentCtrl.searchQuery = '';
    studentCtrl.students = [];
    studentCtrl.searchResults = [];
    
    studentCtrl.fetchDetails = function() {
        var params = {
            choice: "student"
        };
        
        HttpService.get(ApiEndpoints.user.records, params)
            .then(function(response) {
                studentCtrl.students = response.data;
                studentCtrl.searchResults = studentCtrl.students;
            });
    };
    
    studentCtrl.search = function() {
        var query = studentCtrl.searchQuery.trim().toLowerCase();
        if (!query) {
            studentCtrl.searchResults = studentCtrl.students;
            return;
        }
        
        studentCtrl.searchResults = studentCtrl.students.filter(function(student) {
            return (
                student.full_name.toLowerCase().includes(query) ||
                (student.email && student.email.toLowerCase().includes(query)) ||
                (student.phone_number && student.phone_number.toLowerCase().includes(query)) ||
                (student.academic_info.course && student.academic_info.course.toLowerCase().includes(query)) ||
                (student.academic_info.department && student.academic_info.department.toLowerCase().includes(query)) ||
                (student.academic_info.year && student.academic_info.year.toLowerCase().includes(query)) ||
                (student.academic_info.section && student.academic_info.section.toLowerCase().includes(query))
            );
        });
    };
    
    studentCtrl.exportToExcel = function() {
        if (!studentCtrl.searchResults || studentCtrl.searchResults.length === 0) {
            alert("No data available to export.");
            return;
        }
        var htmlContent = '<table><tr>' +
            '<th>Name</th>' +
            '<th>Email</th>' +
            '<th>Phone Number</th>' +
            '<th>Date of Birth</th>' +
            '<th>Course</th>' +
            '<th>Department</th>' +
            '<th>Year</th>' +
            '<th>Section</th>' +
            '</tr>';
        
        studentCtrl.searchResults.forEach(function(student) {
            htmlContent += '<tr>';
            htmlContent += `<td>${student.full_name || 'N/A'}</td>`;
            htmlContent += `<td>${student.email || 'N/A'}</td>`;
            htmlContent += `<td>${student.phone_number || 'N/A'}</td>`;
            htmlContent += `<td>${student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</td>`;
            htmlContent += `<td>${student.academic_info.course || 'N/A'}</td>`;
            htmlContent += `<td>${student.academic_info.department || 'N/A'}</td>`;
            htmlContent += `<td>${student.academic_info.year || 'N/A'}</td>`;
            htmlContent += `<td>${student.academic_info.section || 'N/A'}</td>`;
            htmlContent += '</tr>';
        });
        
        htmlContent += '</table>';
        
        var blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "student_records.xls");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    studentCtrl.deleteStudent = function(studentId) {
        var confirmDelete = confirm("Are you sure you want to delete this student record?");
        if (confirmDelete) {
            console.log('Student deletion would be implemented here');
        }
    };
    
    studentCtrl.fetchDetails();
}]);

app.controller('facultyController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var facCtrl = this;
    
    facCtrl.searchQuery = '';
    facCtrl.searchResults = [];
    
    facCtrl.fetchDetails = function() {
        var params = { choice: "faculty" };
        HttpService.get(ApiEndpoints.user.records, params)
            .then(function(response) {
                facCtrl.coe = response.data[0].coe;
                facCtrl.hods = response.data[1].hod;
                facCtrl.facs = response.data[2].faculty;
                facCtrl.searchResults = facCtrl.facs;
            });
    };
    
    facCtrl.search = function() {
        var query = facCtrl.searchQuery.trim().toLowerCase();
        if (!query) {
            facCtrl.searchResults = facCtrl.facs;
            return;
        }
        
        facCtrl.searchResults = facCtrl.facs.filter(function(fac) {
            return (
                fac.full_name.toLowerCase().includes(query) ||
                (fac.email && fac.email.toLowerCase().includes(query)) ||
                (fac.phone_number && fac.phone_number.toLowerCase().includes(query)) ||
                (fac.academic_info.course && fac.academic_info.course.toLowerCase().includes(query)) ||
                (fac.academic_info.department && fac.academic_info.department.toLowerCase().includes(query))
            );
        });
    };
    
    facCtrl.exportToExcel = function() {
        if (!facCtrl.searchResults || facCtrl.searchResults.length === 0) {
            alert("No data available to export.");
            return;
        }
        
        var htmlContent = '<table><tr><th>Name</th><th>Email</th><th>Phone Number</th><th>DOB</th><th>Course</th><th>Department</th></tr>';
        
        facCtrl.searchResults.forEach(function(fac) {
            htmlContent += '<tr>';
            htmlContent += `<td>${fac.full_name || 'N/A'}</td>`;
            htmlContent += `<td>${fac.email || 'N/A'}</td>`;
            htmlContent += `<td>${fac.phone_number || 'N/A'}</td>`;
            htmlContent += `<td>${fac.dob ? new Date(fac.dob).toLocaleDateString() : 'N/A'}</td>`;
            htmlContent += `<td>${fac.academic_info.course || 'N/A'}</td>`;
            htmlContent += `<td>${fac.academic_info.department || 'N/A'}</td>`;
            htmlContent += '</tr>';
        });
        
        htmlContent += '</table>';
        
        var blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "faculty_records.xls");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    facCtrl.fetchDetails();
}]);

app.controller('courseController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var coCtrl = this;

    coCtrl.fetchDetails = function() {
        var params = {
            choice: "courses"
        }
        HttpService.get(ApiEndpoints.user.records,params)
            .then(function(response) {
                coCtrl.courses = response.data;
                coCtrl.deps= response.data.departments;
            });
    };

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
        if (Object.prototype.toString.call(time) === '[object Date]') {
            return time.toTimeString().slice(0, 8); 
        }
        return time;
    };
    
    makeCtrl.formatDate = function(dateString) {
        if (!dateString) return null;
        var dateObj = new Date(dateString);
        return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    
    makeCtrl.openScheduleModal = function() {
        makeCtrl.subjects = [];
        makeCtrl.addSubjects();
    };
    
    makeCtrl.addSubjects = function() {
        makeCtrl.subjects.push({
            subject: '',
            date: '',
            start_time: ''
        });
    };
    
    makeCtrl.remove = function(index) {
        makeCtrl.subjects.splice(index, 1);
    };
    
    makeCtrl.saveSchedule = function() {
        var data = {
            course_id: makeCtrl.course,
            department_id: makeCtrl.dep,
            year_id: makeCtrl.year,
            exam_type: makeCtrl.exam,
            exam_details: makeCtrl.subjects.map(function(subject) {
                return {
                    subject_id: subject.subject,
                    exam_date: makeCtrl.formatDate(subject.date),
                    start_time: makeCtrl.formatTime(subject.start_time)
                };
            })
        };
        HttpService.post(ApiEndpoints.exam.makeSchedule, data)
            .then(function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Successful!',
                    text: response.message || 'Schedule Submitted Successfully!'
                });
                $('#scheduleModal').modal('hide');
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
        var params = {
            pid: courseId
        }
        HttpService.get(ApiEndpoints.create.main, params)
            .then(function(response) {
                makeCtrl.deps = response.data;
            });
    };
    
    makeCtrl.fetchYears = function(depId) {
        if (!depId) {
            depId = makeCtrl.dep;
        }
        var params = {
            pid: depId
        }
        HttpService.get(ApiEndpoints.create.main, params)
            .then(function(response) {
                makeCtrl.years = response.data;
            });
    };
    
    makeCtrl.fetchSubjects = function(yearId) {
        if (!yearId) {
            yearId = makeCtrl.year;
        }
        var params = {
            pid: yearId
        }
        HttpService.get(ApiEndpoints.create.main, params)
            .then(function(response) {
                makeCtrl.availableSubjects = response.subjects;
            });
    };
    
    makeCtrl.fetchCourses();
    makeCtrl.fetchExams();
}]);

app.controller('scheduleController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var schedCtrl = this;

    schedCtrl.fetchSchedule = function() {
        var params = {
            exam_id: schedCtrl.exam,
            course_id:schedCtrl.course,
            department_id: schedCtrl.dep,
            year_id: schedCtrl.year
        }
        HttpService.get(ApiEndpoints.exam.makeSchedule, params)
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
        var params = {
            pid: courseId
        }
        HttpService.get(ApiEndpoints.create.main, params)
            .then(function(response) {
                schedCtrl.deps = response.data;
            });
    };

    schedCtrl.fetchYears = function(depId) {
        if (!depId) {
            depId = schedCtrl.dep;
        }
        var params = {
            pid: depId
        }
        HttpService.get(ApiEndpoints.create.main, params)
            .then(function(response) {
                schedCtrl.years = response.data;
            });
    };

    schedCtrl.fetchExams();
    schedCtrl.fetchCourses();
}]);

app.controller('hodPaperController', ['HttpService', 'ApiEndpoints', function(HttpService, ApiEndpoints) {
    var hodCtrl = this;
  
    hodCtrl.facs = [];
    hodCtrl.selectedFaculty = null;
    hodCtrl.currentPaperDetails = null;
  
    hodCtrl.fetchExams = function() {
      HttpService.get(ApiEndpoints.exam.type)
        .then(function(response) {
          hodCtrl.exams = response.data;
        });
    };
  
    hodCtrl.fetchYears = function() {
      HttpService.get(ApiEndpoints.exam.years)
        .then(function(response) {
          hodCtrl.years = response.data;
        });
    };
  
    hodCtrl.fetchData = function(examId) {
      if (!examId) {
        examId = hodCtrl.exam;
      }
      var params = {
        exam_id: examId
      }
      HttpService.get(ApiEndpoints.exam.select, params)
        .then(function(response) {
          hodCtrl.subjects = response.data;
        });
    };
  
    hodCtrl.fetchDetails = function() {
      var params = {
        exam_id: hodCtrl.exam,
        year_id: hodCtrl.year,
        subject_id: hodCtrl.sub
      }
      HttpService.get(ApiEndpoints.exam.select, params)
        .then(function(response) {
          hodCtrl.facs = response.data;
        });
    };
  
    hodCtrl.viewPaper = function(faculty_id, schedule_id) {
      var params = {
        faculty_id: faculty_id,
        schedule_id: schedule_id
      }
      HttpService.get(ApiEndpoints.exam.select, params)
        .then(function(response) {
          hodCtrl.currentPaperDetails = response.data;
          hodCtrl.sched = response.schedule_id;
          $('#paperDetailsModal').modal('show');
        });
    };
  
    hodCtrl.approvePaper = function(faculty_id, schedule_id) {
      var data = {
        faculty_id: faculty_id,
        schedule_id: schedule_id
      }
      HttpService.patch(ApiEndpoints.exam.select, data)
      .then(function(response) {
        Swal.fire({
          icon: 'success',
          title: 'Approved',
          text: 'Paper approved successfully'
        });
        $('#paperDetailsModal').modal('hide');
      });
    };
  
    hodCtrl.fetchExams();
    hodCtrl.fetchYears();
}]);

app.controller('ExamController', ['$window', '$document', 'HttpService', 'ApiEndpoints', '$timeout', function($window, $document, HttpService, ApiEndpoints, $timeout) {
    var examCtrl = this; 
    examCtrl.details = {};
    examCtrl.questions = [];

    const dummyExamData = {
        "message": "success",
        "data": [
            {
                "examination_name": "CT",
                "time_duration": 7200,
                "maximum_marks": 60,
                "question_sheet": [
                    {
                        "question_number": "1",
                        "question_text": "What is DSTL ?",
                        "options": [
                            {"id": 2, "value": "football"},
                            {"id": 3, "value": "basketball"},
                            {"id": 4, "value": "leprosy"},
                            {"id": 5, "value": "subject"}
                        ]
                    },
                    {
                        "question_number": "2",
                        "question_text": "Why is DSTL ?",
                        "options": [
                            {"id": 9, "value": "To torture"},
                            {"id": 10, "value": "To play"},
                            {"id": 11, "value": "To hate"},
                            {"id": 12, "value": "To study"}
                        ]
                    },
                    {
                        "question_number": "3",
                        "question_text": "Where is DSTL ?",
                        "options": [
                            {"id": 16, "value": "Home"},
                            {"id": 17, "value": "Building"},
                            {"id": 18, "value": "College"},
                            {"id": 19, "value": "MamaEARth"}
                        ]
                    }
                ],
                "total_questions": 3
            }
        ]
    };

    examCtrl.fetchExams = function() {
        examCtrl.exams = [
            {id: 1, value: 'CT Exam'}
        ];
    };

    examCtrl.fetchSubjects = function(exam_id) {
        examCtrl.subjects = [
            {subject__id: 1, subject__value: 'Sample Subject'}
        ];
    };

    examCtrl.fetchDetails = function(exam_id, subject_id) {
        var response = dummyExamData;
        examCtrl.details = response.data[0];
        examCtrl.questions = examCtrl.details.question_sheet;
        examCtrl.currentSubject = examCtrl.details.examination_name;
        examCtrl.currentQuestionIndex = 0;
        examCtrl.totalQuestions = examCtrl.details.total_questions;
        examCtrl.selectedAnswer = null;
        examCtrl.examCompleted = false;
        examCtrl.userResponses = [];

        examCtrl.timeRemaining = examCtrl.details.time_duration;
        enterFullScreen();
        startTimer();
        
        angular.element(document.getElementById('exam-selection')).hide();
        angular.element(document.getElementById('exam-container')).show();
    };

    examCtrl.getCurrentQuestion = function() {
        return examCtrl.questions[examCtrl.currentQuestionIndex];
    };

    examCtrl.nextQuestion = function() {
        if (examCtrl.selectedAnswer !== null) {
            var currentQuestion = examCtrl.getCurrentQuestion();
            var selectedOption = currentQuestion.options[examCtrl.selectedAnswer];

            examCtrl.userResponses.push({
                questionNumber: currentQuestion.question_number,
                questionText: currentQuestion.question_text,
                selectedOption: {
                    id: selectedOption.id,
                    value: selectedOption.value
                }
            });

            if (examCtrl.currentQuestionIndex < examCtrl.totalQuestions - 1) {
                examCtrl.currentQuestionIndex++;
                examCtrl.selectedAnswer = null;
            } else {
                examCtrl.submitExam();
            }
        } 
        // else {
        //     alert('Please select an answer before proceeding.');
        // }
    };

    examCtrl.previousQuestion = function() {
        if (examCtrl.currentQuestionIndex > 0) {
            examCtrl.currentQuestionIndex--;
        }
    };

    function startTimer() {
        var timer = $timeout(function() {
            examCtrl.timeRemaining--;
            var minutes = Math.floor(examCtrl.timeRemaining / 60);
            // var hours = Math.floor(minutes / 60);
            var seconds = examCtrl.timeRemaining % 60;
            examCtrl.timeRemainingFormatted = 
                // (hours < 10 ? '0' : '') + hours + ':' +
                (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

            if (examCtrl.timeRemaining > 0 && !examCtrl.examCompleted) {
                startTimer();
            } else if (examCtrl.timeRemaining <= 0) {
                examCtrl.submitExam(true); 
            }
        }, 1000);
    }

    examCtrl.submitExam = function(forcedSubmit) {
        if (examCtrl.examCompleted) return;

        examCtrl.examCompleted = true;
        var examSubmissionData = {
            examination_name: examCtrl.currentSubject,
            responses: examCtrl.userResponses,
            // forcedSubmit: forcedSubmit || false,
            maximum_marks: examCtrl.details.maximum_marks
        };

        console.log('Exam Submission Data:', examSubmissionData);

        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }

        angular.element(document.getElementById('exam-selection')).show();
        angular.element(document.getElementById('exam-container')).hide();
    };

    function cheatDetection() {
        // Prevent copy-paste-cut
        $document.on('copy cut paste', function(event) {
            event.preventDefault();
            alert('This action is not allowed during the exam.');
            return false;
        });

        // Disable right-click
        $document.on('contextmenu', function(event) {
            event.preventDefault();
            return false;
        });

        // Disable text selection
        $document.on('selectstart', function(event) {
            event.preventDefault();
            return false;
        });

        $document.on('keydown', function(event) {
            const isBlockedKey = 
                ((event.ctrlKey || event.metaKey) && 
                    ['c', 'v', 'x', 'a', 'i', 'j', 'd'].includes(event.key.toLowerCase())) ||
                
                // Dev tools 
                (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(event.key.toLowerCase())) || // Windows/Linux
                (event.metaKey && event.altKey && ['i', 'j'].includes(event.key)) || // Mac

                // alt+tab or cmd+tab
                (event.altKey && ['ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) ||
                (event.metaKey && event.key === 'Tab');
        
            if (isBlockedKey) {
                alert('This action is not allowed during the exam.');
                event.preventDefault();
                return false;
            }
        });

        // Tab change and visibility 
        let tabChangeCount = 0;
        const maxTabChanges = 1;

        function handleTabChange() {
            tabChangeCount++;
            if (tabChangeCount > maxTabChanges && !examCtrl.examCompleted) {
                alert('Multiple tab switches are not allowed. Your exam will be submitted.');
                examCtrl.submitExam(true);
            }
        }

        $document.on('visibilitychange', function() {
            if (document.hidden && !examCtrl.examCompleted) {
                handleTabChange();
            }
        });

        $window.addEventListener('blur', function() {
            if (!examCtrl.examCompleted) {
                handleTabChange();
            }
        });
    }

    function enterFullScreen() {
        var docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
    }

    examCtrl.fetchExams();
    cheatDetection();
}]);

// app.controller('ExamController', ['$window', '$document', 'HttpService', 'ApiEndpoints', '$timeout', function($window, $document, HttpService, ApiEndpoints, $timeout) {
//     var examCtrl = this; 
//     examCtrl.details = {};
//     examCtrl.questions = [];

//     examCtrl.fetchExams = function() {
//         HttpService.get(ApiEndpoints.user.exam)
//             .then(function(response) {
//                 examCtrl.exams = response.data;
//             });
//     };

//     examCtrl.fetchSubjects = function(exam_id) {
//         var params = {
//           exam_id: exam_id
//         }
//         HttpService.get(ApiEndpoints.user.sub, params)
//         .then(function(response) {
//             examCtrl.subjects = response.data;
//         });
//     };

//     examCtrl.fetchDetails = function(exam_id, subject_id) {
//         var params = {
//           exam_id: exam_id,
//           subject_id: subject_id
//         }
//         HttpService.get(ApiEndpoints.exam.questions, params)
//         .then(function(response) {
//             examCtrl.details = response.data[0];
//             examCtrl.questions = examCtrl.details.question_sheet;
//             examCtrl.currentSubject = examCtrl.details.examination_name;
//             examCtrl.currentQuestionIndex = 0;
//             examCtrl.totalQuestions = examCtrl.details.total_questions;
//             examCtrl.selectedAnswer = null;
//             examCtrl.examCompleted = false;
//             examCtrl.userResponses = [];

//             examCtrl.timeRemaining = examCtrl.details.time_duration;
//             enterFullScreen();
//             startTimer();
//         });
//     };

//     examCtrl.getCurrentQuestion = function() {
//         return examCtrl.questions[examCtrl.currentQuestionIndex];
//     };

//     examCtrl.nextQuestion = function() {
//         if (examCtrl.selectedAnswer !== null) {
//             var currentQuestion = examCtrl.getCurrentQuestion();
//             var selectedOption = currentQuestion.options[examCtrl.selectedAnswer];

//             examCtrl.userResponses.push({
//                 questionNumber: currentQuestion.question_number,
//                 questionText: currentQuestion.question_text,
//                 selectedOption: {
//                     id: selectedOption.id,
//                     value: selectedOption.value
//                 }
//             });

//             if (examCtrl.currentQuestionIndex < examCtrl.totalQuestions - 1) {
//                 examCtrl.currentQuestionIndex++;
//                 examCtrl.selectedAnswer = null;
//             } else {
//                 examCtrl.submitExam();
//             }
//         } else {
//             alert('Please select an answer before proceeding.');
//         }
//     };

//     function startTimer() {
//         var timer = $timeout(function() {
//             examCtrl.timeRemaining--;

//             var minutes = Math.floor(examCtrl.timeRemaining / 60);
//             var seconds = examCtrl.timeRemaining % 60;
//             examCtrl.timeRemainingFormatted = 
//                 (minutes < 10 ? '0' : '') + minutes + ':' + 
//                 (seconds < 10 ? '0' : '') + seconds;

//             if (examCtrl.timeRemaining > 0 && !examCtrl.examCompleted) {
//                 startTimer();
//             } else if (examCtrl.timeRemaining <= 0) {
//                 examCtrl.submitExam(true); 
//             }
//         }, 1000);
//     }

//     examCtrl.submitExam = function(forcedSubmit) {
//         examCtrl.examCompleted = true;
//         var examSubmissionData = {
//             examination_name: examCtrl.currentSubject,
//             responses: examCtrl.userResponses,
//             forcedSubmit: forcedSubmit || false,
//             maximum_marks: examCtrl.details.maximum_marks
//         };

//         console.log('Exam Submission Data:', examSubmissionData);
//     };

//     $document.on('copy', function(event) {
//         alert('This action is not allowed during the exam.');
//         event.preventDefault();
//         return false;
//     });
//     $document.on('cut', function(event) {
//         alert('This action is not allowed during the exam.');
//         event.preventDefault();
//         return false;
//     });
//     $document.on('paste', function(event) {
//         alert('This action is not allowed during the exam.');
//         event.preventDefault();
//         return false;
//     });

//     $document.on('contextmenu', function(event) {
//         event.preventDefault();
//         return false;
//     });

//     $document.on('selectstart', function(event) {
//         event.preventDefault();
//         return false;
//     });

//     function enterFullScreen() {
//         var docElm = document.documentElement;
//         if (docElm.requestFullscreen) {
//             docElm.requestFullscreen();
//         } else if (docElm.mozRequestFullScreen) { 
//             docElm.mozRequestFullScreen();
//         } else if (docElm.webkitRequestFullScreen) { 
//             docElm.webkitRequestFullScreen();
//         }
//     }

//     var tabChangeCount = 0;
//     var maxTabChanges = 1; 

//     function handleTabChange() {
//         tabChangeCount++;
//         if (tabChangeCount > maxTabChanges) {
//             examCtrl.submitExam(true); 
//         }
//     }

//     $document.on('visibilitychange', function() {
//         if (document.hidden) {
//             handleTabChange();
//         }
//     });

//     $window.addEventListener('blur', function() {
//         handleTabChange();
//     });

//     $document.on('keydown', function(event) {
//         const isBlockedKey = 
//             ((event.ctrlKey || event.metaKey) && 
//                 ['c', 'v', 'x', 'a', 'i'].includes(event.key.toLowerCase())) ||
            
//             (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') || 
//             (event.metaKey && event.altKey && event.key === 'i') || 

//             (event.altKey && ['ArrowLeft', 'ArrowRight'].includes(event.key));
    
//         if (isBlockedKey) {
//             alert('This action is not allowed during the exam.');
//             event.preventDefault();
//             return false;
//         }
//     });

//     examCtrl.fetchExams();
// }]);

