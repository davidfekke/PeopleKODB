/*
 * David Fekke Copyright 2013
 * davidfekke@gmail.com
 * Sample TypeScript for IndexDB, KO, and JQuery
 */

///<reference path="jquery.d.ts" />
///<reference path='jqueryui.d.ts' />
///<reference path='knockout.d.ts' />

var db;

class PersonModel {
    id: any;
    firstName: string;
	lastName: string;
	phone: string;
	email: string;
	
	constructor(_key, _firstName, _lastName, _phone, _email) {
	    this.id = _key;
	    this.firstName = _firstName;
		this.lastName = _lastName;
		this.phone = _phone;
		this.email = _email;
    }
}

class AppViewModel {
	people = ko.observableArray();
			
	key = ko.observable('');
	firstName = ko.observable('');
	lastName = ko.observable('');
	phone = ko.observable('');
	email = ko.observable('');

	currentPerson: any;
	
	constructor() {
	    this.currentPerson = ko.computed(() => {
	        return new PersonModel(this.key, this.firstName, this.lastName, this.phone, this.email);
	    });
	}

	addPerson(): void {
		var myPerson = new PersonModel(this.key(), this.firstName(), this.lastName(), this.phone(), this.email());
		this.people.push(myPerson);
		
		//Get a transaction
		//default for OS list is all, default for type is read
		var transaction = db.transaction(["people"],"readwrite");
		//Ask for the objectStore
		var store = transaction.objectStore("people");
		
		if (my.vm.key() === "") {
		    store.add({ firstName: myPerson.firstName, lastName: myPerson.lastName, phone: myPerson.phone, email: myPerson.email });
		} else {
		    store.put(myPerson);
		}
		
	}

	editPerson(p: PersonModel): void {
	    my.vm.key(p.id);
	    my.vm.firstName(p.firstName);
	    my.vm.lastName(p.lastName);
	    my.vm.phone(p.phone);
	    my.vm.email(p.email);
	}

	deletePerson(p: PersonModel): void {
	    db.transaction(["people"], "readwrite").objectStore("people").delete (p.id);
	    my.vm.people.remove((item: PersonModel) => { return item.id === p.id; });
	}
	
	clearPerson(): void {
		this.firstName('');
		this.lastName('');
		this.phone('');
		this.email('');
	}
}

var getPeople = (filter) =>  {

    var handleResult = (event: any) => {
        var cursor = event.target.result;
        if (cursor) {
            console.dir(cursor);
            console.log(cursor.value.firstName);
            var record = cursor.value;
            var p = new PersonModel(record.id, record.firstName, record.lastName, record.phone, record.email);
            my.vm.people.push(p);
            cursor.continue();
        }
    }


    var transaction = db.transaction(["people"], "readonly");
	var objectStore = transaction.objectStore("people");

	//if (filter) {

	    //Credit: http://stackoverflow.com/a/8961462/52160
	//    var range = IDBKeyRange.bound(filter, filter + "z");
	//    var index = objectStore.index("title");
	//    index.openCursor(range).onsuccess = handleResult;
	//} else {
	    objectStore.openCursor().onsuccess = handleResult;
	//}
	
	
	transaction.oncomplete = (event:any) => {
		//$("#noteList").html(content);
		//my.vm.people = peopleArray;
	};

	transaction.onerror = (event:any) => {
	  // Don't forget to handle errors!
	  console.dir(event);
	};
}



var my = { vm: new AppViewModel() }

$(() => {
	ko.applyBindings(my.vm);
			
	var openRequest = indexedDB.open("peopleDB1",1);

	openRequest.onupgradeneeded = (e:any) => {
		var thisDB = e.target.result;

		console.log("running onupgradeneeded");

		if(!thisDB.objectStoreNames.contains("people")) {
			thisDB.createObjectStore("people", { keyPath: "id", autoIncrement:true });
			
			//thisDB.createIndex("email", "email", {unique:true});
		}
	}

	openRequest.onsuccess = (e:any) => {
		console.log("running onsuccess");

		db = e.target.result;

		console.log("Current Object Stores");
		console.dir(db.objectStoreNames);
		getPeople(null);

	}	

	openRequest.onerror = (e:any) => {
		//Do something for the error
	}
});