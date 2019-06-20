window.addEventListener("load", function () {
var tmp = document.createElement("template");
tmp.innerHTML = '<link rel="stylesheet" href="calendar.css">';

var week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var months = ["January", "February", "March", "April", "May",  "June", "July", "August", "September", "October", "November", "December"];


class MyCalendar extends HTMLElement {
	constructor() {
		super();	
		this.calendarDate = new Date();
		this.currentDate = new Date(this.calendarDate);
		this.created = false;
		this.calendar = this;
		this.attachShadow({mode: "open"});
		this.notesList = {};
	}

	connectedCallback() {
		this.table = document.createElement("div");
		this.tHead = document.createElement("div");
		this.tBody = document.createElement("div");
		this.shadowRoot.appendChild(tmp.content.cloneNode(true));
		this.shadowRoot.appendChild(this.table);
		this.table.classList.add("my-calendar-container");
		this.table.appendChild(this.tHead);
		this.table.appendChild(this.tBody);	
		this.createControls();
		this.createCalendar(this.calendarDate);
		console.log(this);
	}

	createControls() {
		var tControls = document.createElement("div");
		this.tHead.appendChild(tControls);
		tControls.classList.add("my-calendar__controls");

		
		var backBtn = document.createElement("button");
		backBtn.innerHTML = "<";
		tControls.appendChild(backBtn);
		backBtn.addEventListener("click", this.moveBack.bind(this));

		var nowBtn = document.createElement("button");
		nowBtn.innerHTML = "today";
		tControls.appendChild(nowBtn);
		nowBtn.addEventListener("click", this.moveToday.bind(this));


		var forwardBtn = document.createElement("button");
		forwardBtn.innerHTML = ">";
		tControls.appendChild(forwardBtn);
		forwardBtn.addEventListener("click", this.moveForward.bind(this));
	}

	createCalendar(date) {
		if(this.created) {
			this.tHead.removeChild(this.tHead.lastChild);
			this.tHead.removeChild(this.tHead.lastChild);
			var tBodyLength = this.tBody.children.length;
			for (var i = 0; i < tBodyLength; i++) {
				this.tBody.removeChild(this.tBody.firstChild);
			}
		}

		var tCaption = document.createElement("div");
		this.tHead.appendChild(tCaption);
		tCaption.innerHTML = months[date.getMonth()] + " " +
			date.getFullYear();
		tCaption.classList.add("my-calendar__info");

		var daysRow = document.createElement("div");
		daysRow.classList.add("my-calendar__row");
		for(var i = 0; i < 7; i++) {
			var cell = document.createElement("div");
			cell.classList.add("my-calendar__cell");
			cell.classList.add("my-calendar__cell_weekday");
			daysRow.appendChild(cell);
			cell.innerHTML = week[i];
		}
		this.tHead.appendChild(daysRow);

		var numberOfCells = 
			this.getFirstDay(date) + this.getCountDays(date);
		if(numberOfCells % 7 != 0)
				numberOfCells += 7 - numberOfCells % 7;

		for(var i = 1, day = 1; i <= numberOfCells; i++) {

			if(i % 7 == 1) {
				var row = document.createElement("div");
				row.classList.add("my-calendar__row");
			}

			var cell = document.createElement("div");
			cell.classList.add("my-calendar__cell");
			row.appendChild(cell);

			if(i > this.getFirstDay(date) && day <= this.getCountDays(date)) {
				this.fillCell(cell, day++);
			}

			this.tBody.appendChild(row);
		}

		this.created = true;
	}

	
	fillCell(cell, day) {
		cell.classList.add("my-calendar__cell_day");

		var dayContainer = document.createElement("div");
		dayContainer.classList.add("my-calendar__day-container");
		var noteContainer = document.createElement("div");
		noteContainer.classList.add("my-calendar__note-container");

		if(this.calendarDate.getFullYear() == this.currentDate.getFullYear() && this.calendarDate.getMonth() == this.currentDate.getMonth() && this.currentDate.getDate() == day) {
					dayContainer.classList.add("my-calendar__day-container_today");
		}


		for(var prop in this.notesList) {
			var date = prop;
			date = date.split(".");
			if(date[2] == this.calendarDate.getFullYear() && date[1] == this.calendarDate.getMonth() + 1 && date[0] == day) {
				noteContainer.innerHTML = this.notesList[prop];
				noteContainer.classList.add("my-calendar__note-container_active");
			}
		}

		cell.appendChild(dayContainer);
		cell.appendChild(noteContainer);

		dayContainer.innerHTML = day;
		cell.addEventListener("click", this.createNotesWindow.bind(this, cell) );
	}

	getCountDays(date) {
		var daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

		if(date.getFullYear() % 4 == 0)
			daysInMonths[1]++;

		return daysInMonths[date.getMonth()];
	}

	getFirstDay(date) {
		var copyDate = date;
		var localDaysIndexes = [6, 0, 1, 2, 3, 4, 5];
		copyDate.setDate(1);
		return localDaysIndexes[copyDate.getDay()];
	}

	moveBack() {
		var month = this.calendarDate.getMonth();
		if(month > 0) {
			this.calendarDate.setMonth(--month);
		} else {
			this.calendarDate.setMonth(11);
			this.calendarDate.setFullYear(this.calendarDate.getFullYear() - 1);
		}
		this.createCalendar(this.calendarDate);
	}

	moveToday() {
		this.calendarDate = new Date();
		this.createCalendar(this.calendarDate);
	}

	moveForward() {
		var month = this.calendarDate.getMonth();
		if(month < 11) {
			this.calendarDate.setMonth(++month);
		} else {
			this.calendarDate.setMonth(0);
			this.calendarDate.setFullYear(this.calendarDate.getFullYear() + 1);
		}
		this.createCalendar(this.calendarDate);
	}


	closeNotesWindow() {
		var notesWindowContainer = 
			this.shadowRoot.querySelector(".my-calendar__notes-window-container");
		this.shadowRoot.removeChild(notesWindowContainer);
	}

	createNotesWindow(cell) {
		if(this.shadowRoot.querySelector(".my-calendar__notes-window")) {
			this.closeNotesWindow();
		}

		var notesWindowContainer = document.createElement("div");
		notesWindowContainer.classList.add("my-calendar__notes-window-container");

		var notesWindow = document.createElement("div");
		notesWindow.classList.add("my-calendar__notes-window");

		var info = document.createElement("div");
		var day = cell.firstChild.innerHTML;
		if(day < 10)
			day = "0" + day;
		var month = this.calendarDate.getMonth() + 1;
		if(month < 10)
			month = "0" + month;
		info.classList.add("my-calendar__notes-info");
		info.innerHTML = day + "." + month + "." + 
			this.calendarDate.getFullYear();

		var noteTxt = document.createElement("textarea");
		noteTxt.classList.add("my-calendar__note-txt");
		noteTxt.value = 
			cell.querySelector(".my-calendar__note-container").innerHTML.replace(/<br\s*[\/]?>/gi, "\n");

		var closeBtn = document.createElement("button");
		closeBtn.innerHTML = "close";
		closeBtn.addEventListener("click", this.closeNotesWindow.bind(this));

		var saveBtn = document.createElement("button");
		saveBtn.innerHTML = "save";
		saveBtn.addEventListener("click", this.attachNote.bind(this, cell));

		notesWindow.appendChild(info);
		notesWindow.appendChild(noteTxt);
		notesWindow.appendChild(saveBtn);
		notesWindow.appendChild(closeBtn);

		notesWindowContainer.appendChild(notesWindow);

		this.shadowRoot.appendChild(notesWindowContainer);
	}

	attachNote(cell) {
			console.log(cell);
			var txtArea = 
				this.shadowRoot.querySelector(".my-calendar__note-txt");
			var date = 
				this.shadowRoot.querySelector(".my-calendar__notes-info").innerHTML;
			var note = 
			cell.querySelector(".my-calendar__note-container");

			note.innerHTML = txtArea.value.replace(/\n\r?/g, '<br />');

			if(note.innerHTML !== "")
				note.classList.add("my-calendar__note-container_active");

			this.notesList[date] = note.innerHTML;

			console.log(this.notesList);

			this.closeNotesWindow();
	}
}

window.customElements.define('my-calendar', MyCalendar);
//console.log(document.createElement("my-calendar").constructor);
});