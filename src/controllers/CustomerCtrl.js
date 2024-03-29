
export default class {
  constructor($scope, $ottp) {
    'ngInject';
    
    this.$scope = $scope;
    this.$ottp = $ottp;
    
    this.init();
  }
  
  async init() {
    if(this.$scope.ngDialogData.id) {
      this.model = await this.$ottp({
        endpoint: 'main',
        path: 'customer/' + this.$scope.ngDialogData.id
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
      path: this.model.id ? `customer/${this.model.id}` : 'customer',
      data: this.model
    });
    
    this.$scope.closeThisDialog(1);
  }
};
