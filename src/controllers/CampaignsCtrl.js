
var swal = require('sweetalert2');

export default class {
  constructor(ngDialog, $ottp, $stateParams) {
    'ngInject';
    
    this.search = '';
    this.ngDialog = ngDialog;
    this.$ottp = $ottp;
    
    this.init();
  }
  
  async init() {
    this.offers = await this.$ottp({
      endpoint: 'main',
      path: 'offer'
    });

    console.log(this.offers);

    this.campaigns = await this.$ottp({
      endpoint: 'main',
      path: 'campaign'
    });
  }
  
  async edit_or_add(id) {
    if((await this.ngDialog.open({
      template: require('../../html/campaign.html'),
      plain: true,
      disableAnimation: true,
      className: 'ngdialog-theme-plain',
      controllerAs: 'ctrl',
      controller: require('./CampaignCtrl.js').default,
      data: { id: id }
    }).closePromise).value == 1)
      await this.init();
  }
  
  async delete(id) {
    var res = await swal({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if(res.value) {
      await this.$ottp({
        endpoint: 'main',
        method: 'DELETE',
        path: 'campaign/' + id
      });
      
      await this.init();
    }
  }
};