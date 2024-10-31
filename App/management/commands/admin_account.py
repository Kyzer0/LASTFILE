from django.core.management.base import BaseCommand
from App.models.teacher import Teacher  # Import your Teacher model instead of User
from django.core.paginator import Paginator, EmptyPage
import re

# Command class for managing admin/superuser accounts through Django management commands
class Command(BaseCommand):
    help = 'Manage admin/superuser accounts'

    # Add command line arguments and subcommands for different admin management operations
    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', help='Action to perform')

        # Create subcommand for adding new admin accounts
        create_parser = subparsers.add_parser('create', help='Create a new admin account')
        create_parser.add_argument('--teacher_id', required=True, help="Admin ID")  # Changed from username
        create_parser.add_argument('--email', required=True, help="Admin email")
        create_parser.add_argument('--password', required=True, help="Admin password")
        create_parser.add_argument('--first_name', required=True, help="Admin's first name")
        create_parser.add_argument('--last_name', required=True, help="Admin's last name")

        # Update subcommand for modifying existing admin accounts
        update_parser = subparsers.add_parser('update', help='Update an existing admin')
        update_parser.add_argument('--email', required=True, help="Admin email")  # Changed from username
        update_parser.add_argument('--teacher_id', help="New teacher ID")
        update_parser.add_argument('--first_name', help="New first name")
        update_parser.add_argument('--last_name', help="New last name")

        # List subcommand for viewing admin accounts with pagination
        list_parser = subparsers.add_parser('list', help='List all admin accounts')
        list_parser.add_argument('--page', type=int, default=1, help="Page number for pagination")
        list_parser.add_argument('--per_page', type=int, default=10, help="Number of admins per page")

        # Delete subcommand for removing admin accounts
        delete_parser = subparsers.add_parser('delete', help='Delete an admin account')
        delete_parser.add_argument('--email', required=True, help="Admin email")  # Changed from username

        # Reset password subcommand for changing admin passwords
        reset_parser = subparsers.add_parser('reset_password', help='Reset admin password')
        reset_parser.add_argument('--email', required=True, help="Admin email")  # Changed from username
        reset_parser.add_argument('--new_password', required=True, help="New password")

    # Main handler function that processes different admin management actions
    def handle(self, *args, **options):
        action = options.get('action')
        
        if not action:
            self.stdout.write(self.style.ERROR("No action specified. Use --help to see available actions."))
            return

        if action == 'create':
            self.create_admin(options)
        elif action == 'update':
            self.update_admin(options)
        elif action == 'list':
            self.list_admins(options)
        elif action == 'delete':
            self.delete_admin(options)
        elif action == 'reset_password':
            self.reset_admin_password(options)
        else:
            self.stdout.write(self.style.ERROR(f"Invalid action: {action}"))

    # Creates a new admin account after validating required fields
    def create_admin(self, options):
        try:
            # Validate password
            is_valid, message = self.validate_password(options['password'])
            if not is_valid:
                self.stdout.write(self.style.ERROR(message))
                return

            # Validate email
            is_valid, message = self.validate_email(options['email'])
            if not is_valid:
                self.stdout.write(self.style.ERROR(message))
                return

            # Check if email already exists
            if Teacher.objects.filter(email=options['email']).exists():
                self.stdout.write(self.style.ERROR(f"Email already exists: {options['email']}"))
                return

            # Create superuser using Teacher model
            admin = Teacher.objects.create_superuser(
                teacher_id=options['teacher_id'],
                email=options['email'],
                password=options['password'],
                first_name=options['first_name'],
                last_name=options['last_name']
            )

            self.stdout.write(
                self.style.SUCCESS(f"Successfully created admin account: {options['email']}")
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to create admin account: {str(e)}"))

    # Updates an existing admin's information
    def update_admin(self, options):
        try:
            admin = Teacher.objects.get(email=options['email'], is_superuser=True)
            
            if options.get('teacher_id'):
                admin.teacher_id = options['teacher_id']
            
            if options.get('first_name'):
                admin.first_name = options['first_name']
            
            if options.get('last_name'):
                admin.last_name = options['last_name']
            
            admin.save()
            self.stdout.write(
                self.style.SUCCESS(f"Successfully updated admin account: {options['email']}")
            )
        except Teacher.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Admin account not found: {options['email']}"))

    # Lists admin accounts with pagination
    def list_admins(self, options):
        queryset = Teacher.objects.filter(is_superuser=True)

        paginator = Paginator(queryset, options['per_page'])
        try:
            admins = paginator.page(options['page'])
        except EmptyPage:
            self.stdout.write(self.style.WARNING(f"Page {options['page']} is out of range."))
            return

        if admins:
            self.stdout.write(
                self.style.SUCCESS(f"List of admin accounts (Page {options['page']} of {paginator.num_pages}):")
            )
            for admin in admins:
                self.stdout.write(
                    f"ID: {admin.teacher_id}, Email: {admin.email}, "
                    f"Name: {admin.first_name} {admin.last_name}"
                )
            
            self.stdout.write(
                self.style.SUCCESS(f"Showing {len(admins)} of {paginator.count} admin accounts")
            )
        else:
            self.stdout.write(self.style.WARNING("No admin accounts found."))

    # Deletes an admin account
    def delete_admin(self, options):
        try:
            admin = Teacher.objects.get(email=options['email'], is_superuser=True)
            email = admin.email
            admin.delete()
            self.stdout.write(
                self.style.SUCCESS(f"Successfully deleted admin account: {email}")
            )
        except Teacher.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f"Admin account not found: {options['email']}")
            )

    # Resets password for an admin account
    def reset_admin_password(self, options):
        try:
            admin = Teacher.objects.get(email=options['email'], is_superuser=True)
            
            # Validate new password
            is_valid, message = self.validate_password(options['new_password'])
            if not is_valid:
                self.stdout.write(self.style.ERROR(message))
                return

            admin.set_password(options['new_password'])
            admin.save()
            self.stdout.write(
                self.style.SUCCESS(f"Successfully reset password for admin account: {options['email']}")
            )
        except Teacher.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Admin account not found: {options['email']}"))

    # Validates that password meets security requirements
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

    # Validates email format
    def validate_email(self, email):
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return False, "Invalid email format"
        return True, "Email is valid"




from django.contrib import admin
from App.models import Timeline
from django.utils import timezone

# Admin model class for managing Timeline objects in Django admin interface
@admin.register(Timeline)
class TimelineAdmin(admin.ModelAdmin):
    list_display = ('section', 'duration', 'start_time', 'is_active', 'get_end_time', 'status')
    list_filter = ('is_active', 'section')
    actions = ['activate_timeline', 'deactivate_timeline']

    # Gets the end time for a timeline
    def get_end_time(self, obj):
        return obj.end_time
    get_end_time.short_description = 'End Time'

    # Gets the current status of a timeline
    def status(self, obj):
        return "Active" if obj.is_timeline_active() else "Inactive"
    status.short_description = 'Status'

    # Action to activate selected timelines
    def activate_timeline(self, request, queryset):
        now = timezone.now()
        for timeline in queryset:
            timeline.start_time = now
            timeline.is_active = True
            timeline.save()
    activate_timeline.short_description = "Activate selected timelines"

    # Action to deactivate selected timelines
    def deactivate_timeline(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_timeline.short_description = "Deactivate selected timelines" 