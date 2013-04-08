/*
 * David Fekke Copyright 2013
 * davidfekke@gmail.com
 * Sample TypeScript for IndexDB, KO, and JQuery
 */

///<reference path="jquery.d.ts" />
///<reference path='jqueryui.d.ts' />

var db;

class PersonModel {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	
	constructor(_firstName: string, _lastName: string, _phone: string, _email: string) {
        this.firstName = _firstName;
		this.lastName = _lastName;
		this.phone = _phone;
		this.email = _email;
    }
}

class AppViewModel {
	
	people = ko.observableArray();
			
	firstName = ko.observable('');
	lastName = ko.observable('');
	phone = ko.observable('');
	email = ko.observable('');
	
	addPerson(): void {
		var myPerson = new PersonModel(this.firstName(), this.lastName(), this.phone(), this.email());
		this.people.push(myPerson);
		
		//Get a transaction
		//default for OS list is all, default for type is read
		var transaction = db.transaction(["people"],"readwrite");
		//Ask for the objectStore
		var store = transaction.objectStore("people");
		
		store.add(myPerson);
	}
	
	currentPerson = ko.computed(() => {
		return new PersonModel(this.firstName, this.lastName, this.phone, this.email);
	}, this);
	
	clearPerson(): void {
		this.firstName('');
		this.lastName('');
		this.phone('');
		this.email('');
	}
}

function getPeople() {
	var transaction = db.transaction(["people"], "readonly"); 
	var objectStore = transaction.objectStore("people");
	objectStore.openCursor().onsuccess = (event) => {
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
	
	transaction.oncomplete = (event) => {
		//$("#noteList").html(content);
		//my.vm.people = peopleArray;
	};

	transaction.onerror = (event) => {
	  // Don't forget to handle errors!
	  console.dir(event);
	};
}

var my = { vm: new AppViewModel() }

$(() => {
	ko.applyBindings(my.vm);
			
	var openRequest = indexedDB.open("peopleDB1",1);

	openRequest.onupgradeneeded = (e) => {
		var thisDB = e.target.result;

		console.log("running onupgradeneeded");

		if(!thisDB.objectStoreNames.contains("people")) {
			thisDB.createObjectStore("people", { keyPath: "id", autoIncrement:true });
			
			//thisDB.createIndex("email", "email", {unique:true});
		}
	}

	openRequest.onsuccess = (e) => {
		console.log("running onsuccess");

		db = e.target.result;

		console.log("Current Object Stores");
		console.dir(db.objectStoreNames);
		getPeople();

	}	

	openRequest.onerror = (e) => {
		//Do something for the error
	}
});