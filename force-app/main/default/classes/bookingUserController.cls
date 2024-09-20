public with sharing class bookingUserController {
    
    @AuraEnabled(cacheable=true)
    public static string getCurrentUserTimeZone(){
        try {
            return UserInfo.getTimeZone().getID();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}