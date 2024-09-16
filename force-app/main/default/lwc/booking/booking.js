import { LightningElement, track,wire,api } from 'lwc';
import GetUsers from '@salesforce/apex/bookingController.GetUsers';
import logger from '@salesforce/apex/bookingController.logger';
import saveSlotData from '@salesforce/apex/bookingController.saveSlotData';
import getAllBookings from '@salesforce/apex/bookingController.getAllBookings';

export default class Booking extends LightningElement {
    mapdata = new Map();
    @track users = [{Id:'aaa',Name:'Usama'},{Id:'aaa',Name:'Usama'},{Id:'aaa',Name:'Usama'},{Id:'aaa',Name:'Usama'}]; // Replace with actual user data
   // @track dates = ['2024-08-19', '2024-08-20', '2024-08-21']; // Replace with actual date data
    @track dates = [];
    @track timeSlots = ['9-11 AM', '10-12 PM', '11-1 PM', '12-2 PM', '2-4 PM', '3-5 PM'];
    year;
    month;
    firstDate;
    lastDate;
    currentDate;
    arrivalDayTime;
    filterValue = 'Monthly';
    isWeekly = false;
    isMonthly = true;
    isDaily = false;
    objData = [];
    @track isDisabled = false;

    handleEditBtn()
    {
        this.isDisabled = false;
        this.objData = [];
    }
     handleDateChange(event) {
         
         const newDate = event.target.value;
         this.arrivalDayTime = this.formatDateForSalesforce(newDate);
         console.log('Date Change: ', this.arrivalDayTime);
     }
    formatDateForSalesforce(datetimeStr) {
        if (!datetimeStr) return null;
        const date = new Date(datetimeStr);
        return date.toISOString();
    }
    // @wire(getAllBookings)
    // wiredgetAllBookings({ error, data }) {
    //     debugger;
    //     if (data) {
    //         console.log(JSON.stringify(data));
    //     }
    //     if (error) {
    //         console.log('Error Get bookings: ' + JSON.stringify(error));
    //     }    
    // }
    CallGetAllBookings()
    {
        debugger;
      //  let _this = this;
        getAllBookings()
            .then((result) => {
                this.exsitingData = result;
                console.log('Response: ' + JSON.stringify(result));
                this.isDisabled = true;
               // this.refreshCheckboxes(_this)
            })
        .catch((error) => {
            console.log('error: ' + JSON.stringify(error));
        });
    }
    renderedCallback() {
        debugger;
       const _this = this
        if (this.template)
        {
            console.log('template found');
        }
        this.refreshCheckboxes(_this);
    }
    refreshCheckboxes(refThis)
    {
        this.exsitingData.forEach(function(item){
            console.log(item.bookingName);
            console.log(item.bookingDate);
            console.log(item.bookingId);
            console.log(item.bookingSlots);
            console.log(item.bookingUserId);
            console.log(item.bookingUserName);
            if (item.bookingSlots && item.bookingSlots.includes(";"))
            {
                let slotsArray = item.bookingSlots.split(';');
                if (refThis.template)
                {
                    slotsArray.forEach(function (currentSlot) {
                    let checkBox = refThis.template.querySelector(
                        `input[data-date="${item.bookingDate}"][data-slot="${currentSlot}"][data-userid="${item.bookingUserId}"]`
                );

                // Perform actions based on the result
                if (checkBox) {

                    console.log("Checkbox found:", checkBox);
                    checkBox.checked = true;
                    
                    // You can now manipulate the checkbox, like checking if it's checked or unchecked
                    if (checkBox.checked) {
                        console.log("Checkbox is checked");
                    
                    } else {
                        console.log("Checkbox is unchecked");
                    }
                } else {
                    console.log("No checkbox found with the given data attributes");
                }
                
                });
                }
            }
            else if (item.bookingSlots)
            {
                let checkBox = refThis.template.querySelector(
                        `input[data-date="${item.bookingDate}"][data-slot="${item.bookingSlots}"][data-userid="${item.bookingUserId}"]`
                );
                if (checkBox) {

                    console.log("Checkbox found:", checkBox);
                    checkBox.checked = true;
                    
                    // You can now manipulate the checkbox, like checking if it's checked or unchecked
                    if (checkBox.checked) {
                        console.log("Checkbox is checked");
                    
                    } else {
                        console.log("Checkbox is unchecked");
                    }
                } else {
                    console.log("No checkbox found with the given data attributes");
                }
            }
        });
    }

    get filterOptions() {
        return [
            { label: 'Daily', value: 'Daily' },
            { label: 'Weekly', value: 'Weekly' },
            { label: 'Monthly', value: 'Monthly' },
        ];
    }
    handleFilterChange(event) {
       
        this.isDaily = false;
        this.isWeekly = false;
        this.isMonthly = false;
        switch (event.detail.value)
        {

            case 'Daily':
                this.filterValue = 'Daily';
                this.isDaily = true;
                break;
            case 'Weekly':
                this.filterValue = 'Weekly';
                this.isWeekly = true;
                const currentDate = new Date();
                this.firstDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
                const temp = new Date(this.firstDate);
                this.lastDate = new Date();
                this.lastDate.setDate(temp.getDate() + 7);
       
                break;
            case 'Monthly':
                 this.currentDate = new Date();
                this.year = this.currentDate.getFullYear();
                this.month = this.currentDate.getMonth();
                this.firstDate = this.getFirstDate(this.year, this.month);
                this.lastDate = this.getLastDate(this.year,this.month);
                this.filterValue = 'Monthly';
                this.isMonthly = true;
                break;
        }
        this.generateDates();
    }
    
    handleCheckbox(event) {
        debugger;
        const selectedDate = event.target.getAttribute('data-date');
        const selectedSlot = event.target.getAttribute('data-slot');
        const selectedUserId = event.target.getAttribute('data-userid');
        const selectedUserName = event.target.getAttribute('data-username');

        console.log('Date:', selectedDate);
        console.log('Slot:', selectedSlot);
        console.log('User ID:', selectedUserId);
        console.log('User Name:', selectedUserName);
        
        const checkboxes = this.template.querySelectorAll(`input[type="checkbox"][data-date="${selectedDate}"][data-userid="${selectedUserId}"]`);
        checkboxes.forEach(checkbox => {
            console.log('User Id: ' + checkbox.dataset.userid + ', date: ' + checkbox.dataset.date + ', slot: ' + checkbox.dataset.slot + ', Is Checked: ' + checkbox.checked);
            this.objData = [... this.objData, 
                {
                    'userId': checkbox.dataset.userid,
                    'date': checkbox.dataset.date,
                    'slot': checkbox.dataset.slot,
                    'isChecked': checkbox.checked,
                    'username': checkbox.dataset.username
                }
           ]
        });
        console.log('records: ', this.objData);
        
    }
    finalResult = {};

    generateRequestParam() {
        let validationMsgs = [];
        let result = this.objData.reduce((acc, curr) => {
        let key = `${curr.userId}_${curr.date}`;

        if (!acc[key]) {
            acc[key] = { userId: curr.userId, date: curr.date, slots: [], isChecked: [], username: curr.username };
        }

        acc[key].slots.push(curr.slot);
        acc[key].isChecked.push(curr.isChecked);
            
        if (acc[key].slots.length > 6) {
        acc[key].slots = acc[key].slots.slice(-6);
        acc[key].isChecked = acc[key].isChecked.slice(-6);
        }
       

        return acc;
    }, {});

     this.finalResult = Object.values(result).map(item => ({
        userId: item.userId,
        date: item.date,
        slots: item.slots.join(', '),
         isChecked: item.isChecked.join(', '),
        username: item.username
    }));

        console.log(this.finalResult);
        
        let transformedJson = {};

        for (let key in result) {
        let entry = result[key];
        transformedJson[key] = {
            userId: entry.userId,
            date: entry.date,
            username:entry.username,
            slots: {}
        };

        entry.slots.forEach((slot, index) => {
            transformedJson[key].slots[slot] = entry.isChecked[index];
        });
        }

        console.log('New JSON: ' + JSON.stringify(transformedJson));
        debugger;
        for (const key in transformedJson) {
        if (transformedJson.hasOwnProperty(key)) {
            const userSchedule = transformedJson[key];
            console.log(`User ID: ${userSchedule.userId}`);
            console.log(`Date: ${userSchedule.date}`);
            let validSlots = false;
            let counterSlots = 0;
            for (const slot in userSchedule.slots) {
                const isAvailable = userSchedule.slots[slot];
                if (isAvailable)
                {
                    counterSlots++;
                }
                console.log(`Time Slot: ${slot} - Available: ${isAvailable}`);
            }

            console.log('----------------');
            if (counterSlots < 2)
            {
                validationMsgs.push(`User: ${userSchedule.username} needs minimum 2 slots for ${userSchedule.date} to save`);
                console.log(`User ID: ${userSchedule.userId} needs minimum 2 slots for ${userSchedule.date} to save`);
                delete transformedJson[key];
            }
            else {
                validSlots = true;
            }
        }
        }
        let _this = this;
        if (Object.keys(transformedJson).length > 0)
        {
            saveSlotData({ data: transformedJson })
            .then((result) => {
                debugger;
                this.CallGetAllBookings();
              //  this.refreshCheckboxes(_this);
                //result = JSON.parse(result);
               // console.log(result);
                if (result.status) {
                    // this.isDisabled = true;
                    alert(result.msg);
                }
                else {
                     
                    alert('Error: ' + result.msg);
                }
            })
            .catch((error) => {
                debugger;
            console.log(error);
        });
        }
        if (validationMsgs.length > 0)
        {
            alert(validationMsgs.join('\n'));
        }
    }
    getArrivalDayTime() {
        const date = new Date();
        date.setMonth(5); // June (0-indexed)
        date.setDate(16);
        date.setHours(16, 0); // 4:00 PM


        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = dayNames[date.getDay()];

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthName = monthNames[date.getMonth()];

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // The hour '0' should be '12'

        const formattedDate = `${dayName} ${date.getDate()}, ${monthName} ${hours}:${minutes} ${ampm}`;

       this.arrivalDayTime = formattedDate;
      // this.arrivalDayTime = formattedDate;
    }
    getFirstDate(year,month)
    {
        return new Date(year, month, 1);
    }
    getLastDate(year,month)
    {
        return new Date(year, month+1, 0);
    }


    usersList = [];
    @wire(GetUsers)
    wiredUsers({ error, data }) {
        if (error) {
           // debugger;
           // this.dispatchToastErrorEvent(error);
        } else if (data) {
            //debugger;
            data = JSON.parse(data);
            this.usersList = data;
        }
    }
    connectedCallback() {
        // debugger;
        this.CallGetAllBookings();
        this.currentDate = new Date();
        this.year = this.currentDate.getFullYear();
        this.month = this.currentDate.getMonth();
        this.firstDate = this.getFirstDate(this.year, this.month);
        this.lastDate = this.getLastDate(this.year,this.month);
        this.generateDates();
        this.getArrivalDayTime();
        logger()
            .then((result) => {
                console.log('inserted');
            })
            .catch((error) => { 
                console.log(error);
            })
        // Fetch users and dates if needed
    }
    @track exsitingData=[];
    generateDates() {
       const dateList = [];

        let currentDate = new Date(this.firstDate);
        const lastDate = new Date(this.lastDate);
        while (currentDate <= lastDate) {
            dateList.push({
                        date: this.formatDate(currentDate),
                        key: 'date-'+this.formatDate(currentDate) // Unique key for each date
                    });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        this.dates = dateList;        
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }
    
    handleNextMonth() {
       // debugger;
        this.month = this.month + 1;
        this.firstDate = this.getFirstDate(this.year, this.month);
        this.lastDate = this.getLastDate(this.year,this.month);
        this.generateDates();
    }
    handleNextWeek() {
        //debugger;
       
        const currentDate = this.firstDate;
        let tempDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));

        this.firstDate = new Date(tempDate.getTime());
        this.firstDate.setDate(tempDate.getDate() + 7);

        this.lastDate = new Date(this.firstDate.getTime());
        this.lastDate.setDate(this.firstDate.getDate() + 6);
        this.generateDates();
    }
}
