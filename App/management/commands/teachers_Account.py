from django.core.management.base import BaseCommand
from App.models.teacher import Teacher
from django.core.paginator import Paginator, EmptyPage
import re

# Command class for managing teacher accounts through Django management commands
class Command(BaseCommand):
    help = 'Manage teacher accounts'

    # Add command line arguments and subcommands for different teacher management operations
    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', help='Action to perform')

        # Create subcommand for adding new teachers
        create_parser = subparsers.add_parser('create', help='Create a new teacher')
        create_parser.add_argument('--teacher_id', required=True, help="Teacher ID")
        create_parser.add_argument('--email', required=True, help="Teacher email")
        create_parser.add_argument('--password', required=True, help="Teacher password")
        create_parser.add_argument('--first_name', required=True, help="Teacher's first name")
        create_parser.add_argument('--last_name', required=True, help="Teacher's last name")

        # Update subcommand for modifying existing teachers
        update_parser = subparsers.add_parser('update', help='Update an existing teacher')
        update_parser.add_argument('--email', required=True, help="Teacher email")
        update_parser.add_argument('--teacher_id', help="Teacher ID")
        update_parser.add_argument('--password', help="Teacher password")
        update_parser.add_argument('--first_name', help="Teacher's first name")
        update_parser.add_argument('--last_name', help="Teacher's last name")

        # Delete subcommand for removing teachers
        delete_parser = subparsers.add_parser('delete', help='Delete a teacher')
        delete_parser.add_argument('--email', required=True, help="Teacher email")

        # List subcommand for viewing teachers with pagination
        list_parser = subparsers.add_parser('list', help='List teachers')
        list_parser.add_argument('--email', help="Filter teachers by email")
        list_parser.add_argument('--teacher_id', help="Filter teachers by ID")
        list_parser.add_argument('--page', type=int, default=1, help="Page number for pagination")
        list_parser.add_argument('--per_page', type=int, default=10, help="Number of teachers per page")

        # Reset password subcommand for changing teacher passwords
        reset_password_parser = subparsers.add_parser('reset_password', help='Reset teacher password')
        reset_password_parser.add_argument('--email', required=True, help="Teacher email")
        reset_password_parser.add_argument('--new_password', required=True, help="New password")

        # Update email subcommand for changing teacher email addresses
        update_email_parser = subparsers.add_parser('update_email', help='Update teacher email')
        update_email_parser.add_argument('--old_email', required=True, help="Current email")
        update_email_parser.add_argument('--new_email', required=True, help="New email")

    # Main handler function that processes different teacher management actions
    def handle(self, *args, **options):
        action = options['action']

        if action == 'create':
            self.create_teacher(options)
        elif action == 'update':
            self.update_teacher(options)
        elif action == 'delete':
            self.delete_teacher(options)
        elif action == 'list':
            self.list_teachers(options)
        elif action == 'reset_password':
            self.reset_password(options)
        elif action == 'update_email':
            self.update_email(options)
        else:
            self.stdout.write(self.style.ERROR(f"Invalid action: {action}"))

    # Creates a new teacher account after validating required fields
    def create_teacher(self, options):
        try:
            # Validate that first_name and last_name are not empty
            if not options.get('first_name') or not options.get('last_name'):
                self.stdout.write(self.style.ERROR("First name and last name are required"))
                return

            Teacher.objects.create_user(
                teacher_id=options['teacher_id'],
                email=options['email'],
                password=options['password'],
                first_name=options['first_name'],
                last_name=options['last_name']
            )
            self.stdout.write(self.style.SUCCESS(f"Successfully created teacher: {options['email']}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to create teacher: {str(e)}"))

    # Updates an existing teacher's information
    def update_teacher(self, options):
        try:
            teacher = Teacher.objects.get(email=options['email'])
            if options['teacher_id']:
                teacher.teacher_id = options['teacher_id']
            if options['password']:
                teacher.set_password(options['password'])
            if options['first_name']:
                teacher.first_name = options['first_name']
            if options['last_name']:
                teacher.last_name = options['last_name']
            teacher.save()
            self.stdout.write(self.style.SUCCESS(f"Successfully updated teacher: {options['email']}"))
        except Teacher.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Teacher not found: {options['email']}"))

    # Deletes a teacher account
    def delete_teacher(self, options):
        try:
            teacher = Teacher.objects.get(email=options['email'])
            teacher.delete()
            self.stdout.write(self.style.SUCCESS(f"Successfully deleted teacher: {options['email']}"))
        except Teacher.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Teacher not found: {options['email']}"))

    # Lists teachers with optional filtering and pagination
    def list_teachers(self, options):
        queryset = Teacher.objects.all()

        # Apply filters
        if options.get('email'):
            queryset = queryset.filter(email__icontains=options['email'])
        if options.get('teacher_id'):
            queryset = queryset.filter(teacher_id__icontains=options['teacher_id'])

        # Pagination
        paginator = Paginator(queryset, options['per_page'])
        page = options['page']
        
        try:
            teachers = paginator.page(page)
        except EmptyPage:
            self.stdout.write(self.style.WARNING(f"Page {page} is out of range."))
            return

        if teachers:
            self.stdout.write(self.style.SUCCESS(f"List of teachers (Page {page} of {paginator.num_pages}):"))
            for teacher in teachers:
                self.stdout.write(f"ID: {teacher.teacher_id}, Email: {teacher.email}, Name: {teacher.full_name}")
            
            self.stdout.write(self.style.SUCCESS(f"Showing {len(teachers)} of {paginator.count} teachers"))
        else:
            self.stdout.write(self.style.WARNING("No teachers found matching the criteria."))

        # Navigation info
        if teachers.has_previous():
            self.stdout.write(f"For previous page, use: --page {teachers.previous_page_number()}")
        if teachers.has_next():
            self.stdout.write(f"For next page, use: --page {teachers.next_page_number()}")

    # Validates password meets security requirements
    def validate_password(self, password):
        """Validate password meets requirements"""
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False, "Password must contain at least one special character"
        
        return True, "Password is valid"

    # Validates email format using regex pattern
    def validate_email(self, email):
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return False, "Invalid email format"
        return True, "Email is valid"

    # Resets a teacher's password after validation
    def reset_password(self, options):
        try:
            teacher = Teacher.objects.get(email=options['email'])
            
            # Validate new password
            is_valid, message = self.validate_password(options['new_password'])
            if not is_valid:
                self.stdout.write(self.style.ERROR(message))
                return

            teacher.set_password(options['new_password'])
            teacher.save()
            self.stdout.write(self.style.SUCCESS(f"Successfully reset password for teacher: {options['email']}"))
        except Teacher.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Teacher not found: {options['email']}"))

    # Updates a teacher's email address after validation
    def update_email(self, options):
        try:
            teacher = Teacher.objects.get(email=options['old_email'])
            
            # Validate new email
            is_valid, message = self.validate_email(options['new_email'])
            if not is_valid:
                self.stdout.write(self.style.ERROR(message))
                return

            teacher.email = options['new_email']
            teacher.save()
            self.stdout.write(self.style.SUCCESS(
                f"Successfully updated email from {options['old_email']} to {options['new_email']}"
            ))
        except Teacher.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Teacher not found: {options['old_email']}"))
