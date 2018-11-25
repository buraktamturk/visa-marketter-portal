
var swal = require('sweetalert2');

export default class {
  constructor($ottp, $stateParams) {
    'ngInject';
    
    this.search = '';

    this.$ottp = $ottp;
    this.$stateParams = $stateParams;
    
    this.init();
  }
  
  async init() {
    this.datas = await this.$ottp({
      endpoint: 'main',
      path: 'campaign/' + this.$stateParams.id
    });
  }
};