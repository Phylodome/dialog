triAngular Dialog
=================

![bower package 0.3.0](https://img.shields.io/badge/bower_package-0.3.0-green.svg?style=flat-square)
![built with gulp](https://img.shields.io/badge/built_with-gulp-lightgrey.svg?style=flat-square)
![license wtf](https://img.shields.io/badge/license-wtf-blue.svg?style=flat-square)

AngularJS multi modal dialog module

* [Triangular](http://triangular.io)
* [Demo](http://jsfiddle.net/triangular/suh96jt6/embedded/result,js,html,css/)

Installing
----------

To start using triAngular Dialog in your app run:

```
bower install tri-angular-dialog --save-dev
```

Then add 'triNgDialog' dependency to modules that will use triDialog (you need to have ngAnimate installed):

```javascript
angular.module('myApp', [

    …

    'ngAnimate'

    …

    'triNgDialog'

    …

]);
```

One more thing is decision, which DOM element would be main container for dialogs (body is preferred):

```html
<body tri-dialog-root>
    …
</body>
```

Now you can use 'triDialog' service to trigger any dialog:

```javascript
angular.module('myApp').controller('MyController', function (triDialog) {

    …

    triDialog({
        controller: 'MyDialogController',
        dialogClass: 'my-dialog-css-class',
        templateUrl: '/partials/dialogs/my-dialog.html'
    });

    …

});
```

Sample dialog config:
---------------------

```javascript
triDialog({
    blockedDialog: (Boolean),   // if true ESC key nor click on mask does not close dialog (overrides modal)
    controller:    (String),    // angular controller name or constructor
    controllerAs:  (String),    // name of controller to be used in dialog's
    dialogClass:   (String),    // CSS class specific for this dialog
    modal:         (Bool),      // if true click on mask does not close dialog
    namespace:     (String),    // 'label' to match proper 'dialog-root', defaults to 'main'
    templateUrl:   (String),    // route to template, REQUIRED
    // top offset (in scrolled viewport) number of pixels or '123px' or '32%'
    // (0, false or null will put it on top of viewport)
    topOffset:     (String, Number, Bool)
}, { …any data… })
```

Instance
--------

triDialog( … ) returns instance of Dialog (which is also passed to dialog controller or scope):

```
{
    data: any;                                      // data passed as second arg to triDialog()
    promise: Promise<any>;                          // promise resolved on close
    close(reason?: any, reject?: boolean): Dialog;  // close dialog and resolve promise (or reject)
    accept(reason?: any): Dialog;                   // close dialog and resolve promise with passed reason
    cancel(reason?: any): Dialog;                   // close dialog and reject promise with passed reason
}
```

Controller
----------

Controller passed to configuration has access to those locals:

```
{
    $dialog: dialog, // instance of dialog, has method 'close()'
    $data: dialog.data // shortcut to 'someDataToBePassedToController'
}
```

If no controller is passed, dialog has attached instance of dialog as '$dialog' to scope;

The Dialog Module can be configured globally
--------------------------------------------

Global values for all dialogs:


```javascript
app.config(function (triDialogManagerProvider) {

    triDialogManagerProvider.config({
        baseZindex: 3000,          // minimum z-index for mask
        rootClass: 'dialog-root',  // class base for dialog-root tag (when inner dialogs are active)
        maskClass: 'dialog-mask',  // class for mask
        dialogClass: 'dialog',     // class for dialog itself
        processTopOffset: false     // should top offset be counted using some internal rules
     });
     
});
```

You can also pre define dialog configs (and remove those configurations from your controllers/directives/etc:


```javascript
app.config(function (triDialogManagerProvider) {

    triDialogManagerProvider.when('myDialog', {
        controller: 'MyDialogController',
        dialogClass: 'my-dialog-css-class',
        templateUrl: '/partials/dialogs/my-dialog.html'
    });

    triDialogManagerProvider.when('mySecondDialog', {
        controller: 'MySecondDialogController',
        dialogClass: 'my-second-dialog-css-class',
        templateUrl: '/partials/dialogs/my-second-dialog.html'
    });

});
```

or config and definitions can be chained:

```javascript
app.config(function (triDialogManagerProvider) {

    triDialogManagerProvider
        .config({ … })
        .when('myDialog', {
            controller: 'MyDialogController',
            dialogClass: 'my-dialog-css-class',
            templateUrl: '/partials/dialogs/my-dialog.html'
        })
        .when('myDialog', {
            controller: 'MySecondDialogController',
            dialogClass: 'my-second-dialog-css-class',
            templateUrl: '/partials/dialogs/my-second-dialog.html'
        });

});
```

and use it anywhere:


```javascript
angular.module('myApp').controller('MyController', function (triDialog) {

    …

    triDialog('myDialog', { …some data… });

    …

    triDialog('mySecondDialog');

    …

});
```