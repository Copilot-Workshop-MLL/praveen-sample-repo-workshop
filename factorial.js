
    //create a function that takes in a number and returns the factorial of that number
    function factorial(num) {
        if (num === 0 || num === 1) {
            return 1;
        }
        return num * factorial(num - 1);
    }

    //test the function
    console.log(factorial(5)); //120
    console.log(factorial(0)); //1
    console.log(factorial(1)); //1
    console.log(factorial(10)); //3628800


    // Function to validate an email address using a simple regex
    function isValidEmail(email) {
        // Basic email regex pattern
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    }

    // Function to print only valid emails from an array of names/emails
    function printValidEmails(names) {
        for (let i = 0; i < names.length; i++) {
            if (isValidEmail(names[i])) {
                console.log(names[i]);
            }
        }
    }

    //test the function
    const namesArray = ["Alice", "Bob", "Charlie", "David", "alice@example.com", "bob@gmail.com"];
    printValidEmails(namesArray);

    // Export functions for testing
    module.exports = { factorial, isValidEmail, printValidEmails };