import os
import json

def generate_project_structure():
    """
    Function to generate the satellite image analysis application project structure.
    Creates all folders and empty files with the correct hierarchy.
    """
    # Base directory
    base_dir = "satellite-image-analysis"
    
    # Create base directory if it doesn't exist
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)
    
    # Define the directory structure
    directory_structure = {
        "README.md": None,
        ".gitignore": None,
        "docker-compose.yml": None,
        "frontend": {
            "package.json": None,
            "tsconfig.json": None,
            ".eslintrc.js": None,
            "tailwind.config.js": None,
            "Dockerfile": None,
            "public": {
                "favicon.ico": None,
                "assets": {}
            },
            "src": {
                "pages": {
                    "_app.tsx": None,
                    "index.tsx": None,
                    "login.tsx": None,
                    "register.tsx": None,
                    "dashboard.tsx": None,
                    "analysis": {
                        "new.tsx": None,
                        "[id].tsx": None,
                        "compare.tsx": None
                    },
                    "user": {
                        "settings.tsx": None
                    },
                    "admin": {
                        "users.tsx": None
                    }
                },
                "components": {
                    "layout": {
                        "MainLayout.tsx": None,
                        "Header.tsx": None,
                        "Footer.tsx": None,
                        "Navigation.tsx": None,
                        "AuthLayout.tsx": None
                    },
                    "core": {
                        "CoordinateInput.tsx": None,
                        "ImageViewer.tsx": None,
                        "ImageComparisonSlider.tsx": None,
                        "AnalysisTable.tsx": None,
                        "ObjectDetectionConfig.tsx": None,
                        "AnalysisResultsViewer.tsx": None,
                        "PPTDownloadButton.tsx": None
                    },
                    "ui": {
                        "Button.tsx": None,
                        "Input.tsx": None,
                        "Modal.tsx": None,
                        "Checkbox.tsx": None,
                        "Dropdown.tsx": None,
                        "SearchBar.tsx": None,
                        "SortableTable.tsx": None
                    }
                },
                "contexts": {
                    "AuthContext.tsx": None,
                    "AnalysisSettingsContext.tsx": None,
                    "AnalysisDataContext.tsx": None
                },
                "services": {
                    "api.ts": None,
                    "authService.ts": None,
                    "analysisService.ts": None
                },
                "types": {
                    "user.ts": None,
                    "analysis.ts": None
                },
                "styles": {
                    "globals.css": None
                },
                "utils": {
                    "mapHelpers.ts": None,
                    "formatters.ts": None
                }
            },
            "tests": {
                "components": {}
            }
        },
        "backend": {
            "requirements.txt": None,
            "Dockerfile": None,
            ".env.example": None,
            "main.py": None,
            "app": {
                "__init__.py": None,
                "config.py": None,
                "database.py": None,
                "api": {
                    "__init__.py": None,
                    "auth.py": None,
                    "users.py": None,
                    "analysis.py": None,
                    "process.py": None,
                    "reports.py": None
                },
                "models": {
                    "__init__.py": None,
                    "user.py": None,
                    "analysis.py": None,
                    "analysis_settings.py": None
                },
                "services": {
                    "__init__.py": None,
                    "image_processing.py": None,
                    "object_detection.py": None,
                    "geospatial.py": None,
                    "report_generator.py": None
                },
                "utils": {
                    "__init__.py": None,
                    "security.py": None,
                    "validators.py": None
                }
            },
            "tests": {
                "__init__.py": None,
                "test_auth.py": None,
                "test_analysis.py": None
            }
        }
    }
    
    # Create .gitignore content
    gitignore_content = """# Frontend
frontend/node_modules/
frontend/.next/
frontend/out/
frontend/.env.local
frontend/npm-debug.log*
frontend/yarn-debug.log*
frontend/yarn-error.log*

# Backend
backend/__pycache__/
backend/*.py[cod]
backend/*$py.class
backend/venv/
backend/.env
backend/reports/

# Database
*.sqlite3

# General
.DS_Store
.env
.env.local
"""
    
    # Function to recursively create directories and files
    def create_structure(parent_path, structure):
        for item, children in structure.items():
            path = os.path.join(parent_path, item)
            
            # If it's a file (no children or children is None)
            if children is None:
                # Create empty file, or add content for specific files
                with open(path, 'w') as file:
                    if item == '.gitignore':
                        file.write(gitignore_content)
                    # You can add more specific file content here
                print(f"Created file: {path}")
            else:
                # It's a directory
                if not os.path.exists(path):
                    os.makedirs(path)
                    print(f"Created directory: {path}")
                # Recursively create content
                create_structure(path, children)
    
    # Generate the structure
    create_structure(os.getcwd(), {base_dir: directory_structure})
    
    print(f"\nProject structure created in: {os.path.join(os.getcwd(), base_dir)}")
    print("To load this project into Git:")
    print("1. Navigate to the project directory")
    print("2. Run: git init")
    print("3. Run: git add .")
    print("4. Run: git commit -m \"Initial project structure\"")
    print("5. Run: git remote add origin <your-repository-url>")
    print("6. Run: git push -u origin main")

if __name__ == "__main__":
    generate_project_structure()