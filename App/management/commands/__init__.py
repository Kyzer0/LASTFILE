from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.core.paginator import Paginator, EmptyPage
import re

class Command(BaseCommand):
    help = 'Manage admin/superuser accounts'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', help='Action to perform')

        # Create admin subcommand
        create_parser = subparsers.add_parser('create', help='Create a new admin account')
        create_parser.add_argument('--username', required=True, help="Admin username")
        create_parser.add_argument('--email', required=True, help="Admin email")
        create_parser.add_argument('--password', required=True, help="Admin password")
        create_parser.add_argument('--first_name', required=True, help="Admin's first name")
        create_parser.add_argument('--last_name', required=True, help="Admin's last name")

        # List admins subcommand
        list_parser = subparsers.add_parser('list', help='List all admin accounts')
        list_parser.add_argument('--page', type=int, default=1, help="Page number for pagination")
        list_parser.add_argument('--per_page', type=int, default=10, help="Number of admins per page")

        # Delete admin subcommand
        delete_parser = subparsers.add_parser('delete', help='Delete an admin account')
        delete_parser.add_argument('--username', required=True, help="Admin username")

        # Reset password subcommand
        reset_parser = subparsers.add_parser('reset_password', help='Reset admin password')
        reset_parser.add_argument('--username', required=True, help="Admin username")
        reset_parser.add_argument('--new_password', required=True, help="New password")

    def handle(self, *args, **options):
        action = options['action']

        if action == 'create':
            self.create_admin(options)
        elif action == 'list':
            self.list_admins(options)
        elif action == 'delete':
            self.delete_admin(options)
        elif action == 'reset_password':
            self.reset_admin_password(options)
        else:
            self.stdout.write(self.style.ERROR(f"Invalid action: {action}"))

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

            # Create superuser
            admin = User.objects.create_superuser(
                username=options['username'],
                email=options['email'],
                password=options['password'],
                first_name=options['first_name'],
                last_name=options['last_name']
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully created admin account: {options['username']}"
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Failed to create admin account: {str(e)}")
            )

    def list_admins(self, options):
        queryset = User.objects.filter(is_superuser=True)

        # Pagination
        paginator = Paginator(queryset, options['per_page'])
        page = options['page']
        
        try:
            admins = paginator.page(page)
        except EmptyPage:
            self.stdout.write(self.style.WARNING(f"Page {page} is out of range."))
            return

        if admins:
            self.stdout.write(
                self.style.SUCCESS(f"List of admin accounts (Page {page} of {paginator.num_pages}):")
            )
            for admin in admins:
                self.stdout.write(
                    f"Username: {admin.username}, Email: {admin.email}, "
                    f"Name: {admin.first_name} {admin.last_name}"
                )
            
            self.stdout.write(
                self.style.SUCCESS(f"Showing {len(admins)} of {paginator.count} admin accounts")
            )
        else:
            self.stdout.write(self.style.WARNING("No admin accounts found."))

    def delete_admin(self, options):
        try:
            admin = User.objects.get(username=options['username'], is_superuser=True)
            admin.delete()
            self.stdout.write(
                self.style.SUCCESS(f"Successfully deleted admin account: {options['username']}")
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f"Admin account not found: {options['username']}")
            )

    def reset_admin_password(self, options):
        try:
            admin = User.objects.get(username=options['username'], is_superuser=True)
            
            # Validate new password
            is_valid, message = self.validate_password(options['new_password'])
            if not is_valid:
                self.stdout.write(self.style.ERROR(message))
                return

            admin.set_password(options['new_password'])
            admin.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully reset password for admin account: {options['username']}"
                )
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f"Admin account not found: {options['username']}")
            )

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

    def validate_email(self, email):
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return False, "Invalid email format"
        return True, "Email is valid"