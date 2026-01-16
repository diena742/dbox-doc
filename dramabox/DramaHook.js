//frida hook buat cari data

console.log("[+] Hooking Dramabox function O()");

Java.perform(function() {
    var targetClass = "j7.dramaboxapp";
    
    try {
        Java.use(targetClass).O.overload('java.lang.String').implementation = function(paramString) {
            console.log("\n=== DRAMABOX FUNCTION HOOKED ===");
            console.log("[+] Parameter input: " + paramString);
            console.log("[+] Timestamp: " + new Date().toISOString());
            var result = this.O(paramString);
            
            console.log("[+] Return value: " + result);
            console.log("=== END HOOK ===\n");
            
            return result;
        };
        
        console.log("[+] Successfully hooked Dramabox O() function");
        
    } catch (error) {
        console.log("[-] Error hooking: " + error);
        Java.enumerateLoadedClasses({
            onMatch: function(className) {
                if (className.toLowerCase().indexOf("dramabox") !== -1) {
                    console.log("[+] Found potential class: " + className);
                }
            },
            onComplete: function() {}
        });
    }
});
