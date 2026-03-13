import unittest
from print_valid_emails import is_valid_email, print_valid_emails
from io import StringIO
import sys

class TestEmailFunctions(unittest.TestCase):
    def test_is_valid_email(self):
        self.assertTrue(is_valid_email('test@example.com'))
        self.assertFalse(is_valid_email('notanemail'))
        self.assertFalse(is_valid_email(''))

    def test_print_valid_emails(self):
        names = ['Alice', 'bob@gmail.com', 'Charlie', 'david@example.com']
        captured_output = StringIO()
        sys.stdout = captured_output
        print_valid_emails(names)
        sys.stdout = sys.__stdout__
        output = captured_output.getvalue()
        self.assertIn('bob@gmail.com', output)
        self.assertIn('david@example.com', output)
        self.assertNotIn('Alice', output)
        self.assertNotIn('Charlie', output)

if __name__ == '__main__':
    unittest.main()
