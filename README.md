triAngular Dialog
=================

AngularJS multi modal dialog module

To set everything up do (in project root):

```shell
npm install
grunt set-dev
```

then to rebuild dist:

```shell
grunt
```

Can be triggered from JavaScript:
---------------------------------

```javascript
dialogManager.triggerDialog(someDialogData);
```

Sample dialog config:
---------------------

```javascript
someDialogData = {
    dialogClass:        (String),       // CSS class specific for this dialog
    controller:         (String),       // angular controller name, the one to control dialog contents
    topOffset:          (Number, Bool)  // percent of top offset, if 0 or false will bo shown on top of viewport
    modal:              (Bool),         // if true click on mask does not close dialog
    namespace:          (String),       // 'label' to match 'dialog-root', defaults to 'main'
    templateUrl:        (String),       // route to template, MUST BE
}
```

Other properties are appended to 'data' object in $scope, so you can pass any callbacks or models.
Also dialog's $scope has 'closeClick' method.

The Dialog Module can be configured globally
--------------------------------------------

```
app.config(['dialogManagerProvider', function (dialogManagerProvider) {

    dialogManagerProvider.config({
         baseZindex: 3000, // minimum z-index for mask
         rootClass: 'dialog-root', // class base for dialog-root tag (when inner dialogs are active)
         maskClass: 'dialog-mask', // class for mask
         dialogClass: 'dialog', // class for dialog itself
         // those one will be removed/replaced when dialog will use angular $animate service
         showClass: 'show', // class added to dialog and mask 100ms after dialog is appended inside dialog-root
         hideClass: 'hide' // class added to dialog and mask 600ms before dialog is removed inside dialog-root
     });

}]);
```