triAngular Dialog
=================

![bower package 0.3.0-alpha](https://img.shields.io/badge/bower_package-0.3.0--alpha-orange.svg?style=flat-square)
![built with gulp](https://img.shields.io/badge/built_with-gulp-lightgrey.svg?style=flat-square)
![language typescript](https://img.shields.io/badge/lang-typescript-blue.svg?style=flat-square)

AngularJS multi modal dialog module

* [Triangular](http://triangular.io)
* [Demo](http://jsfiddle.net/triangular/suh96jt6/embedded/result,js,html,css/)

Can be triggered from JavaScript:
---------------------------------

```javascript
triDialog(someTriDialogConfig, someDataToBePassedToController);
```

Sample dialog config:
---------------------

```javascript
someTriDialogConfig = {
    controller:    (String),    // angular controller name or constructor
    controllerAs:  (String),    // name of controller to be used in dialog's
    dialogClass:   (String),    // CSS class specific for this dialog
    modal:         (Bool),     // if true click on mask does not close dialog
    namespace:     (String),    // 'label' to match proper 'dialog-root', defaults to 'main'
    templateUrl:   (String),    // route to template, MUST BE
    // top offset (in scrolled viewport) number of pixels or '123px' or '32%'
    // (0, false or null will put it on top of viewport)
    topOffset:     (String, Number, Bool)
}
```

Controller
----------

Controller passed to configuration has acces to those locals:

```
{
    $dialog: dialog, // instance of dialog, has method 'close()'
    $data: dialog.data // shortcut to 'someDataToBePassedToController'
}
```

Other properties are appended to 'data' object in $scope, so you can pass any callbacks or models.
Also dialog's $scope has 'closeClick' method.

The Dialog Module can be configured globally
--------------------------------------------

```
app.config(['triDialogManagerProvider', function (triDialogManagerProvider) {
    triDialogManagerProvider.config({
         baseZindex: 3000, // minimum z-index for mask
         rootClass: 'dialog-root', // class base for dialog-root tag (when inner dialogs are active)
         maskClass: 'dialog-mask', // class for mask
         dialogClass: 'dialog', // class for dialog itself
     });
}]);
```