angular.module('app.services', [])
    .constant('BASE_URL', 'https://10.21.99.26:8000')
    
    .service('ApiEndpoints', ['BASE_URL', function(BASE_URL) {
        return {
            auth: {
                login: `${BASE_URL}/portal/login/`,
                logout: `${BASE_URL}/portal/logout/`,
                register: `${BASE_URL}/portal/register/`
            },
            user: {
                dashboard: `${BASE_URL}/portal/dashboard/`,
                profile: `${BASE_URL}/portal/profile/`,
                records: `${BASE_URL}/portal/records/`,
                gender: `${BASE_URL}/portal/get-genders/`,
                navbar: `${BASE_URL}/portal/`,
                exam: `${BASE_URL}/student/get-exam`,
                sub: `${BASE_URL}/student/get-subjects`
            },
            create: {
                main: `${BASE_URL}/portal/dropdowns/`,
                paper: `${BASE_URL}/faculty/schedule/`,
                exam: `${BASE_URL}/faculty/examination-paper/`,
                course: `${BASE_URL}/portal/get-courses/`
            },
            exam: {
                makeSchedule: `${BASE_URL}/faculty/coe/schedule/`,
                questions: `${BASE_URL}/student/examination/`,
                view: `${BASE_URL}/portal/records/`,
                type: `${BASE_URL}/portal/exam-types/`,
                years: `${BASE_URL}/faculty/get-years/`,
                select: `${BASE_URL}/faculty/hod/examination-paper/`
            }
        };
    }])

    .service('LoaderService', [function() {
        var service = this;
        service.isLoading = false;
        
        service.show = function() {
            service.isLoading = true;
        };
        
        service.hide = function() {
            service.isLoading = false;
        };
    }])

    .factory('LoaderInterceptor', ['$q', 'LoaderService', function($q, LoaderService) {
        var loadingCount = 0;
        
        return {
            request: function(config) {
                loadingCount++;
                LoaderService.show();
                return config;
            },
            response: function(response) {
                loadingCount--;
                if (loadingCount === 0) {
                    LoaderService.hide();
                }
                return response;
            },
            responseError: function(rejection) {
                loadingCount--;
                if (loadingCount === 0) {
                    LoaderService.hide();
                }
                return $q.reject(rejection);
            }
        };
    }])

    .service('HttpService', ['$http', '$q', function($http, $q) {
        function handleRequest(method, url, data) {
            var deferred = $q.defer();
            
            var config = {
                method: method,
                url: url,
                withCredentials: true
            };
            
            if (method === 'GET' && data) {
                config.params = data;
            }
            
            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                config.data = data;
            }
            
            $http(config).then(
                function successCallback(response) {
                    if (response.data) {
                        deferred.resolve(response.data);
                    } else {
                        deferred.resolve(response);
                    }
                }, 
                function errorCallback(response) {
                    var errorMessage = 'An unexpected error occurred';
                    if (response.data && response.data.message) {
                        errorMessage = response.data.message;
                    } else if (response.data && response.data.error) {
                        errorMessage = response.data.error;
                    } 
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorMessage
                    });
                    
                    deferred.reject(response);
                }
            );
            
            return deferred.promise;
        }
        
        return {
            get: function(url, params) {
                return handleRequest('GET', url, params);
            },
            post: function(url, data) {
                return handleRequest('POST', url, data);
            },
            put: function(url, data) {
                return handleRequest('PUT', url, data);
            },
            patch: function(url, data) {
                return handleRequest('PATCH', url, data);
            },
            delete: function(url) {
                return handleRequest('DELETE', url);
            }
        };
    }]);