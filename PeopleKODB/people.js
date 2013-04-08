var db;
var PersonModel = (function () {
    function PersonModel(_firstName, _lastName, _phone, _email) {
        this.firstName = _firstName;
        this.lastName = _lastName;
        this.phone = _phone;
        this.email = _email;
    }
    return PersonModel;
})();
var AppViewModel = (function () {
    function AppViewModel() {
        var _this = this;
        this.people = ko.observableArray();
        this.firstName = ko.observable('');
        this.lastName = ko.observable('');
        this.phone = ko.observable('');
        this.email = ko.observable('');
        this.currentPerson = ko.computed(function () {
            return new PersonModel(_this.firstName, _this.lastName, _this.phone, _this.email);
        });
    }
    AppViewModel.prototype.addPerson = function () {
        var myPerson = new PersonModel(this.firstName(), this.lastName(), this.phone(), this.email());
        this.people.push(myPerson);
        var transaction = db.transaction([
            "people"
        ], "readwrite");
        var store = transaction.objectStore("people");
        store.add(myPerson);
    };
    AppViewModel.prototype.clearPerson = function () {
        this.firstName('');
        this.lastName('');
        this.phone('');
        this.email('');
    };
    return AppViewModel;
})();
var getPeople = function () {
    var transaction = db.transaction([
        "people"
    ], "readonly");
    var objectStore = transaction.objectStore("people");
    objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if(cursor) {
            console.dir(cursor);
            console.log(cursor.value.firstName);
            var record = cursor.value;
            var p = new PersonModel(record.firstName, record.lastName, record.phone, record.email);
            my.vm.people.push(p);
            cursor.continue();
        }
    };
    transaction.oncomplete = function (event) {
    };
    transaction.onerror = function (event) {
        console.dir(event);
    };
};
var my = {
    vm: new AppViewModel()
};
$(function () {
    ko.applyBindings(my.vm);
    var openRequest = indexedDB.open("peopleDB1", 1);
    openRequest.onupgradeneeded = function (e) {
        var thisDB = e.target.result;
        console.log("running onupgradeneeded");
        if(!thisDB.objectStoreNames.contains("people")) {
            thisDB.createObjectStore("people", {
                keyPath: "id",
                autoIncrement: true
            });
        }
    };
    openRequest.onsuccess = function (e) {
        console.log("running onsuccess");
        db = e.target.result;
        console.log("Current Object Stores");
        console.dir(db.objectStoreNames);
        getPeople();
    };
    openRequest.onerror = function (e) {
    };
});
