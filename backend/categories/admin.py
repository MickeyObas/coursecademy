from django.contrib import admin

from .models import Category


class CategoryModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'title']
    list_display_links = ['title']

admin.site.register(Category, CategoryModelAdmin)
