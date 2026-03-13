import re

def is_valid_email(email):
    # Basic email regex pattern
    pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return re.match(pattern, email) is not None

def print_valid_emails(names):
    for name in names:
        if is_valid_email(name):
            print(name)

# Test the function
names_array = ["Alice", "Bob", "Charlie", "David", "alice@example.com", "bob@gmail.com"]
print_valid_emails(names_array)
