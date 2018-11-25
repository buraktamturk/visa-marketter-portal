
export default class {
  constructor($scope, $ottp) {
    'ngInject';
    
    this.$scope = $scope;
    this.$ottp = $ottp;
    
    this.init();
  }
  
  async init() {
    this.offers = await this.$ottp({
      endpoint: 'main',
      path: 'offer'
    });

    console.log(this.offers);
    
    if(this.$scope.ngDialogData.id) {
      this.model = await this.$ottp({
        endpoint: 'main',
        path: 'campaign/' + this.$scope.ngDialogData.id
      });
    } else {
      this.model = {
      };
    }
  }
  
  async save() {
    await this.$ottp({
      endpoint: 'main',
      method: this.model.id ? 'PATCH' : 'PUT',
      path: this.model.id ? `campaign/${this.model.id}` : 'campaign',
      data: this.model
    });
    
    this.$scope.closeThisDialog(1);
  }
};
