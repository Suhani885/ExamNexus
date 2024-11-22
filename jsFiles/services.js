angular.module('app.services', [])
.constant('BASE_URL', 'https://10.21.97.61:8000')

.service('ApiEndpoints', ['BASE_URL', function(BASE_URL) {
    return {
        auth: {
            login: `${BASE_URL}/portal/login/`,
            logout: `${BASE_URL}/portal/logout/`,
            register: `${BASE_URL}/portal/reg/`
        },
        user: {
            profile: `${BASE_URL}/portal/profile/`,
            navbar: `${BASE_URL}/portal/`,
            dashboard: `${BASE_URL}/portal/dashboard/`
        },
        exam: {
            list: `${BASE_URL}/portal/exams/`,
            create: `${BASE_URL}/portal/exam/create/`,
            submit: `${BASE_URL}/portal/exam/submit/`
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

// responseError: function (response) {
//     console.log('response error started...');

//     if (response.status === 401) {
//         $location.path('/signin');
//         $rootScope.$broadcast('error');
//     }

//     if (response.status === 500) {
//         $rootScope.ErrorMsg = "An Unexpected error occured";
//         $location.path('/Error');
//     }

//     return $q.reject(response);
// }

.service('ApiRequest', ['$http', 'ApiEndpoints', function($http, ApiEndpoints) {
    this.get = function(path, callback) {
        var req = {
            method: 'GET',
            url: path,
            withCredentials: true
        };
        $http(req).then(function(response) {
            callback(response.data);
        }, function(err) {
            console.log("Error:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.data.error || "An unexpected error occurred. Please try again!"
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
        }, function(err) {
            console.log("Error:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.data.error || "An unexpected error occurred. Please try again!"
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
        }, function(err) {
            console.log("Error:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.data.error || "An unexpected error occurred. Please try again!"
            });
        });
    };
}]);
