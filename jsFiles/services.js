angular.module('app.services', [])
.constant('BASE_URL', 'https://10.21.98.228:8000')

.service('ApiEndpoints', ['BASE_URL', function(BASE_URL) {
    return {
        auth: {
            login: `${BASE_URL}/portal/login/`,
            logout: `${BASE_URL}/portal/logout/`,
            register: `${BASE_URL}/portal/register/`
        },
        user: {
            records: `${BASE_URL}/portal/profile/`,
            navbar: `${BASE_URL}/portal/`,
            dashboard: `${BASE_URL}/portal/dashboard/`
        },
        create: {
            main: `${BASE_URL}/portal/dropdowns/`,
            course: `${BASE_URL}/portal/get-courses/`,
        },
        exam: {
            create: `${BASE_URL}/portal/qp/`,
            view: `${BASE_URL}/portal/fetchqp/`,
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

.service('ApiRequest', ['$http', 'ApiEndpoints', function($http, ApiEndpoints) {
    this.get = function(path, callback) {
        var req = {
            method: 'GET',
            url: path,
            withCredentials: true
        };
        $http(req).then(function(response) {
            callback(response.data);
        }, function(response) {
            console.log("Error:", response);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || "An unexpected error occurred. Please try again!"
            });
        });
    };

    this.post = function(path, data, callback) {
        var req = {
            method: 'POST',
            url: path,
            data: data,
            withCredentials: true
        };
        $http(req).then(function(response) {
            callback(response.data);
        }, function(response) {
            console.log("Error:", response);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || "An unexpected error occurred. Please try again!"
            });
        });
    };

    this.patch = function(path, data, callback) {
        var req = {
            method: 'PATCH',
            url: path,
            data: data,
            withCredentials: true
        };
        $http(req).then(function(response) {
            callback(response.data);
        }, function(response) {
            console.log("Error:", response);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || "An unexpected error occurred. Please try again!"
            });
        });
    };
}]);


