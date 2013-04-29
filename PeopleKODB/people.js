var db;
var PersonModel = (function () {
    function PersonModel(_key, _firstName, _lastName, _phone, _email) {
        this.id = _key;
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
        this.key = ko.observable('');
        this.firstName = ko.observable('');
        this.lastName = ko.observable('');
        this.phone = ko.observable('');
        this.email = ko.observable('');
        this.currentPerson = ko.computed(function () {
            return new PersonModel(_this.key, _this.firstName, _this.lastName, _this.phone, _this.email);
        });
    }
    AppViewModel.prototype.addPerson = function () {
        var myPerson = new PersonModel(this.key(), this.firstName(), this.lastName(), this.phone(), this.email());
        this.people.push(myPerson);
        var transaction = db.transaction([
            "people"
        ], "readwrite");
        var store = transaction.objectStore("people");
        if(my.vm.key() === "") {
            store.add({
                firstName: myPerson.firstName,
                lastName: myPerson.lastName,
                phone: myPerson.phone,
                email: myPerson.email
            });
        } else {
            store.put(myPerson);
        }
    };
    AppViewModel.prototype.editPerson = function (p) {
        my.vm.key(p.id);
        my.vm.firstName(p.firstName);
        my.vm.lastName(p.lastName);
        my.vm.phone(p.phone);
        my.vm.email(p.email);
    };
    AppViewModel.prototype.deletePerson = function (p) {
        db.transaction([
            "people"
        ], "readwrite").objectStore("people").delete(p.id);
        my.vm.people.remove(function (item) {
            return item.id === p.id;
        });
    };
    AppViewModel.prototype.clearPerson = function () {
        this.firstName('');
        this.lastName('');
        this.phone('');
        this.email('');
    };
    return AppViewModel;
})();
var getPeople = function (filter) {
    var handleResult = function (event) {
        var cursor = event.target.result;
        if(cursor) {
            console.dir(cursor);
            console.log(cursor.value.firstName);
            var record = cursor.value;
            var p = new PersonModel(record.id, record.firstName, record.lastName, record.phone, record.email);
            my.vm.people.push(p);
            cursor.continue();
        }
    };
    var transaction = db.transaction([
        "people"
    ], "readonly");
    var objectStore = transaction.objectStore("people");
    objectStore.openCursor().onsuccess = handleResult;
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
        getPeople(null);
    };
    openRequest.onerror = function (e) {
    };
});
