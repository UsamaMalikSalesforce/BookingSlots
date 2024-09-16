public without sharing class bookingController {
    
    @AuraEnabled
    public static void logger(){
        try {
            List<Booking_Login_Log__c> dataList = [select Id, Name from Booking_Login_Log__c order by createdDate asc];
            if(dataList.size() > 5)
            {
                delete dataList[0];
            }
            Booking_Login_Log__c obj = new Booking_Login_Log__c();
            obj.visited_datetime__c = Datetime.now(); 
            insert obj;
        } catch (Exception e) {
            //throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static string GetUsers(){
        try {
            List<User> users = [select Id,Name from User where isActive=true];
            return JSON.serialize(users);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static HelperClass.Result saveSlotData(Map<String, Map<String, Object>> data) {
        HelperClass.Result result = new HelperClass.Result();
        try {
            List<Booking__c> bookingList = new List<Booking__c>();
            Map<string,date> dateMap = new Map<string,date>();

            // for (String key : data.keySet()) {
            //      Map<String, Object> record = (Map<String, Object>) data.get(key);
            //      String userId = (String) record.get('userId');
            //     String dateBooking = (String) record.get('date');
            //     dateMap.put(userId , dateBooking);
            // }
            // Map<string,Object> userBooking = new Map<string,Object>();
            // List<Booking__c> existingBookings = [select Id,User__c,BookingDate__c from Booking__c where User__c in : dateMap.keySet() and BookingDate__c in : dateMap.values()];
            // if(existingBookings.size() > 0){
            //     //delete existingBookings;
            //     for(Booking__c booking : existingBookings){
            //         userBooking.put(booking.User__c,booking);
            //     }
            // }
        for (String key : data.keySet()) {
            Map<String, Object> record = (Map<String, Object>) data.get(key);
            system.debug(JSON.serialize(record));
            String userId = (String) record.get('userId');
            String dateBooking = (String) record.get('date');
            Date dateBooking2 = date.valueOf(dateBooking) ;
            List<String> trueSlots = new List<String>();
            string slotsString = JSON.serialize(record.get('slots'));
            Map<String, Object> slotData =(Map<String, Object>)JSON.deserializeUntyped(slotsString); 
            system.debug('Slots25: ' +  JSON.serialize(slotData));//
            List<Booking__c> existingBookings = [select Id,User__c,BookingDate__c from Booking__c where User__c=: userId and BookingDate__c =: dateBooking2 order by createdDate desc limit 1];
            
            for(string slot: slotData.keySet()) {

                if(slotData.get(slot) == true) {
                    system.debug('true');
                    system.debug(slot);
                    trueSlots.add(slot);
                }
            }
            system.debug('trueSlots: ' + trueSlots);
            system.debug('line 26');
            String formattedSlots = trueSlots.size() > 0 ? String.join(trueSlots, ';') : '';
            Booking__c temp = new Booking__c();
            temp.User__c = userId;
            if(existingBookings.size() > 0)
            {
                temp.Id = existingBookings[0].Id;
                system.debug('line 28');
            }
            temp.BookingDate__c = Date.valueOf(dateBooking);
            temp.Slots__c = formattedSlots;
            bookingList.add(temp);
        }

        if (!bookingList.isEmpty()) {
            upsert bookingList;
            result.status = true;
            result.msg = 'Data is saved succesfully';
        }
         else {
            result.status = false;
            result.msg = 'No data to be saved';
        }
        } catch (Exception e) {
            system.debug(e.getMessage());
            system.debug(e.getStackTraceString());
             result.status = false;
            result.msg = e.getMessage();
             throw new AuraHandledException(e.getMessage());
        }
        return result;
    }

    @AuraEnabled(cacheable=false)
    public static List<GetBookingWrapper> getAllBookings(){
         List<GetBookingWrapper> wrapperList = new List<GetBookingWrapper>();
        try {
             Map<ID, sObject> m = new Map<ID, sObject>([SELECT Id,Name,Slots__c,User__r.Name, Arrival__c,BookingDate__c FROM Booking__c]);
            
            for (Id bookingId : m.keySet()) {
                Booking__c booking = (Booking__c) m.get(bookingId);
                System.debug('Booking ID: ' + booking.Id);
                System.debug('Booking Name: ' + booking.Name);
                System.debug('Slots: ' + booking.Slots__c);
                System.debug('User Name: ' + booking.User__r.Name);
                System.debug('Arrival: ' + booking.Arrival__c);
                
                GetBookingWrapper wrapper = new GetBookingWrapper();
                wrapper.bookingId = booking.Id;
                wrapper.bookingName = booking.Name;
                wrapper.bookingSlots = booking.Slots__c;
                wrapper.bookingDate = booking.BookingDate__c;
                wrapper.bookingUserName =  booking.User__r.Name;
                wrapper.bookingUserId =  booking.User__c;
                
                wrapperList.add(wrapper);
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return wrapperList;
    }
    public class GetBookingWrapper{
        @AuraEnabled public string bookingId{get;set;}
        @AuraEnabled public Date bookingDate{get;set;}
        @AuraEnabled public string bookingSlots{get;set;}
        @AuraEnabled  public string bookingName{get;set;}
        @AuraEnabled public string bookingUserName{get;set;}
        @AuraEnabled public string bookingUserId{get;set;}
    }
}

