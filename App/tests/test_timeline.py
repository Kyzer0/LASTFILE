from App.models import Student
from django.utils import timezone

   # Create a test student
test_student = Student(
       name='Test Student',
       student_input_id='12345',
       email='test@student.com',
       submission_time=timezone.now()  # Set the current time
   )
test_student.save()  # Save the record to the database