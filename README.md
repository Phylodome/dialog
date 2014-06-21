triAngular Dialog
==============

AngularJS multi modal dialog module

Can be triggered from JavaScript:
--------------

```javascript
dialogManager.triggerDialog(someDialogData);
```

Sample config:
-------------

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

Other properties are appended to 'data' object in dialog's controller if controller is defined or to $scope if not,
so you can pass any callbacks or models. Also dialog's $scope has 'closeClick' method.

