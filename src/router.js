
export default require('angular')
    .module('quiz.router', [
        require('@uirouter/angularjs').default,
        require('angular-moment')
    ])
    .config(function($locationProvider, $stateProvider, $urlRouterProvider) {
        'ngInject';

        $locationProvider.html5Mode(true);

        $urlRouterProvider.otherwise(function($injector) {
          var $state = $injector.get('$state');
          $state.go('page.home');
        });

        $stateProvider
          .state('login', {
            url: '/login',
              template: require('../html/login.html'),
            controllerAs: 'ctrl',
            controller: require('./controllers/LoginController.js').default,
            data: {
              free: 1
            }
          })
          .state('page', {
            abstract: true,
            template: require('../html/page.html'),
            controllerAs: 'page',
            controller: require('./controllers/AppCtrl.js').default
          })
          .state('page.home', {
            url: '/',
            template: require('../html/home.html'),
            controllerAs: 'ctrl',
          })
          .state('page.users', {
            url: '/user',
            template: require('../html/users.html'),
            controller: require('./controllers/UsersCtrl.js').default,
            controllerAs: 'ctrl'
          })
          .state('page.customers', {
            url: '/customers',
            template: require('../html/customers.html'),
            controller: require('./controllers/CustomersCtrl.js').default,
            controllerAs: 'ctrl'
          })
          .state('page.campaigns', {
            url: '/campaigns',
            template: require('../html/campaigns.html'),
            controller: require('./controllers/CampaignsCtrl.js').default,
            controllerAs: 'ctrl'
          })
          .state('page.campaign_detail', {
            url: '/campaign/:id/customers',
            template: require('../html/campaign_customers.html'),
            controller: require('./controllers/CampaignDetailsCtrl.js').default,
            controllerAs: 'ctrl'
          })
          .state('page.pacs', {
            url: '/pac',
            template: require('../html/pacs.html'),
            controller: require('./controllers/PersonalAccessTokensCtrl.js').default,
            controllerAs: 'ctrl'
          });
    })
    .name;
