import re
from typing import Dict, Any, List

def classify_project(idea: str, project_meta: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classifies a project idea/metadata into specific archetypes to dynamically generate
    consistent requirements, database tables, and API endpoints.
    """
    name = project_meta.get("name") or "AI Application"
    desc = (project_meta.get("description") or idea or "").lower()
    industry = (project_meta.get("industry") or "").lower()

    # 1. Classification heuristics
    if any(k in desc or k in industry for k in ["ecommerce", "e-commerce", "shop", "store", "retail", "checkout", "cart", "sales", "purchase", "order"]):
        archetype = "ecommerce"
    elif any(k in desc or k in industry for k in ["chat", "social", "network", "messenger", "forum", "twitter", "facebook", "instagram", "message", "post", "comment", "friend", "follow"]):
        archetype = "social_network"
    elif any(k in desc or k in industry for k in ["task", "project", "todo", "kanban", "trello", "jira", "asana", "workflow", "tracker", "issue", "bug"]):
        archetype = "project_management"
    elif any(k in desc or k in industry for k in ["school", "education", "library", "hospital", "patient", "medical", "hotel", "booking", "reservation", "clinic", "appointment", "class", "student", "teacher", "doctor", "course"]):
        archetype = "booking_management"
    elif any(k in desc or k in industry for k in ["ride", "uber", "delivery", "taxi", "food", "driver", "passenger", "trip", "logistics", "route", "gps", "car"]):
        archetype = "delivery_logistics"
    elif any(k in desc or k in industry for k in ["saas", "subscription", "billing", "analytics", "dashboard", "invoice", "customer", "stripe", "charge"]):
        archetype = "saas_analytics"
    elif any(k in desc or k in industry for k in ["ai", "llm", "agent", "gpt", "rag", "assistant", "jarvius", "copilot", "model", "prompt", "completion", "chatbot"]):
        archetype = "ai_agent"
    else:
        archetype = "generic"

    # Define defaults based on the archetype
    if archetype == "ecommerce":
        proj_name = name if "ecommerce" in name.lower() or "e-commerce" in name.lower() or "shop" in name.lower() or "store" in name.lower() else f"{name} (E-Commerce System)"
        integrations = ["Stripe API (Payments)", "SendGrid API (Emails)", "ElasticSearch/Redis (Catalog caching and search)"]
        actors = ["Anonymous Visitor", "Authenticated Customer", "Store Administrator", "Payment Gateway Webhook"]
        functional_requirements = [
            "User Authentication & Authorization (Signup, login, MFA support).",
            "Product Catalog search with auto-suggest and category filters.",
            "Order creation, checkout validation, tracking, and invoice email generation.",
            "Payment checkout flow integrated with external payment providers (Stripe/PayPal).",
            "Admin operations Dashboard to track inventory, sales, and user roles."
        ]
        tables = [
            {
                "name": "users",
                "columns": ["id (UUID, PK)", "email (VARCHAR, Unique)", "password_hash (VARCHAR)", "role (VARCHAR)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_users_email"],
                "description": "Stores customer and administrator profile details."
            },
            {
                "name": "products",
                "columns": ["id (UUID, PK)", "name (VARCHAR, Index)", "description (TEXT)", "price (DECIMAL)", "stock_quantity (INT)", "category (VARCHAR)"],
                "indexes": ["idx_products_name", "idx_products_category"],
                "description": "Product catalog records with inventory count."
            },
            {
                "name": "orders",
                "columns": ["id (UUID, PK)", "user_id (UUID, FK -> users)", "status (VARCHAR)", "total_amount (DECIMAL)", "created_at (TIMESTAMP, Index)"],
                "indexes": ["idx_orders_user", "idx_orders_created"],
                "description": "Tracks order transactions and shipment status."
            },
            {
                "name": "order_items",
                "columns": ["id (UUID, PK)", "order_id (UUID, FK -> orders)", "product_id (UUID, FK -> products)", "quantity (INT)", "price (DECIMAL)"],
                "indexes": ["idx_order_items_order"],
                "description": "Item details within a single customer order."
            }
        ]
        endpoints = [
            {"path": "/api/auth/register", "method": "POST", "description": "Create a new user account", "request_body": "{email, password, full_name}", "response_body": "{id, email, role, token}"},
            {"path": "/api/auth/login", "method": "POST", "description": "Authenticate user credentials", "request_body": "{email, password}", "response_body": "{token, expires_in}"},
            {"path": "/api/products", "method": "GET", "description": "Get catalog list (paginated, filterable)", "request_body": "None (Query params: search, limit, offset)", "response_body": "{items: [...], total}"},
            {"path": "/api/orders", "method": "POST", "description": "Create shopping order checkout", "request_body": "{items: [{product_id, quantity}], payment_method}", "response_body": "{order_id, status, total_amount}"},
            {"path": "/api/orders/{id}", "method": "GET", "description": "Retrieve order history details", "request_body": "None", "response_body": "{id, status, items: [...], total_amount}"}
        ]
        db_type = "PostgreSQL"
        caching_strategy = "Redis Cache-Aside for read-heavy entities (products). Session tokens blacklisted on logout in Redis store."
        partitioning = "Partition orders table by RANGE (monthly/yearly) under multi-million orders scale."
        replication = "Primary-Replica structure. 1 primary writer node, 2 read replicas with load-balancer endpoints."
        caching_type = "Redis"

    elif archetype == "social_network":
        proj_name = name if "social" in name.lower() or "network" in name.lower() or "chat" in name.lower() or "messenger" in name.lower() else f"{name} (Social Platform)"
        integrations = ["Firebase Cloud Messaging (Notifications)", "Cloudinary / AWS S3 (Media Storage)", "Perspective API (Content Moderation)"]
        actors = ["Registered User", "Moderator", "System Admin", "Notification Daemon"]
        functional_requirements = [
            "User profile management including avatars, bios, and follower counts.",
            "Create posts with text, images, and hashtags.",
            "Real-time commenting and liking activities on posts.",
            "One-to-one secure chat messaging using WebSockets.",
            "Admin moderation queue to flag offensive text or media."
        ]
        tables = [
            {
                "name": "users",
                "columns": ["id (UUID, PK)", "username (VARCHAR, Unique)", "email (VARCHAR, Unique)", "password_hash (VARCHAR)", "avatar_url (VARCHAR)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_users_username"],
                "description": "Stores social application profiles."
            },
            {
                "name": "posts",
                "columns": ["id (UUID, PK)", "user_id (UUID, FK -> users)", "content (TEXT)", "media_url (VARCHAR)", "created_at (TIMESTAMP, Index)"],
                "indexes": ["idx_posts_user", "idx_posts_created"],
                "description": "User created posts/updates."
            },
            {
                "name": "comments",
                "columns": ["id (UUID, PK)", "post_id (UUID, FK -> posts)", "user_id (UUID, FK -> users)", "content (TEXT)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_comments_post"],
                "description": "Comments attached to posts."
            },
            {
                "name": "follows",
                "columns": ["id (UUID, PK)", "follower_id (UUID, FK -> users)", "followed_id (UUID, FK -> users)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_follows_follower", "idx_follows_followed"],
                "description": "Tracks follower relations between users."
            }
        ]
        endpoints = [
            {"path": "/api/auth/register", "method": "POST", "description": "Create a new user account", "request_body": "{username, email, password}", "response_body": "{id, username, email, token}"},
            {"path": "/api/posts", "method": "POST", "description": "Create a new text/media post", "request_body": "{content, media_url}", "response_body": "{id, content, media_url, created_at}"},
            {"path": "/api/posts", "method": "GET", "description": "Retrieve social feed posts", "request_body": "None (Query params: limit, before_id)", "response_body": "{posts: [...]}"},
            {"path": "/api/posts/{id}/comments", "method": "POST", "description": "Leave a comment on a post", "request_body": "{content}", "response_body": "{id, post_id, content, created_at}"},
            {"path": "/api/users/{id}/follow", "method": "POST", "description": "Follow or unfollow a user", "request_body": "None", "response_body": "{status: 'following'}"}
        ]
        db_type = "PostgreSQL + MongoDB (for chats)"
        caching_strategy = "Redis Pub/Sub for WebSockets. Key-value caching for user follower counts."
        partitioning = "Hash partitioning on posts by user_id for distributed write scaling."
        replication = "Primary node with 2 scale replicas. Read replicas handle feed builds."
        caching_type = "Redis"

    elif archetype == "project_management":
        proj_name = name if "task" in name.lower() or "project" in name.lower() or "todo" in name.lower() or "kanban" in name.lower() else f"{name} (Task Management)"
        integrations = ["Slack API (Integrations)", "Google Calendar API (Sync)", "AWS S3 (Attachments Storage)"]
        actors = ["Workspace Owner", "Team Member", "External Collaborator", "Automation Webhook"]
        functional_requirements = [
            "Create and manage multi-tenant Workspaces, Boards, Lists, and Tasks.",
            "Drag-and-drop task movement along custom kanban board columns.",
            "Assign tasks, set due dates, add descriptions, and upload attachments.",
            "Real-time notifications sent to team members on task modifications.",
            "Export project sprint summaries and performance metrics charts."
        ]
        tables = [
            {
                "name": "users",
                "columns": ["id (UUID, PK)", "email (VARCHAR, Unique)", "password_hash (VARCHAR)", "full_name (VARCHAR)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_users_email"],
                "description": "System user records."
            },
            {
                "name": "workspaces",
                "columns": ["id (UUID, PK)", "name (VARCHAR)", "owner_id (UUID, FK -> users)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_workspaces_owner"],
                "description": "Multi-tenant workspace divisions."
            },
            {
                "name": "boards",
                "columns": ["id (UUID, PK)", "workspace_id (UUID, FK -> workspaces)", "name (VARCHAR)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_boards_workspace"],
                "description": "Individual project kanban boards."
            },
            {
                "name": "tasks",
                "columns": ["id (UUID, PK)", "board_id (UUID, FK -> boards)", "assignee_id (UUID, FK -> users)", "title (VARCHAR, Index)", "description (TEXT)", "status (VARCHAR)", "due_date (TIMESTAMP)"],
                "indexes": ["idx_tasks_board", "idx_tasks_title"],
                "description": "Sprint tasks with workflow status."
            }
        ]
        endpoints = [
            {"path": "/api/auth/register", "method": "POST", "description": "Create user profile", "request_body": "{email, password, full_name}", "response_body": "{id, email, token}"},
            {"path": "/api/workspaces", "method": "POST", "description": "Create workspace container", "request_body": "{name}", "response_body": "{id, name}"},
            {"path": "/api/boards", "method": "GET", "description": "Get workspace boards", "request_body": "None (Query params: workspace_id)", "response_body": "[{id, name}]"},
            {"path": "/api/tasks", "method": "POST", "description": "Add new task card", "request_body": "{board_id, title, description, due_date}", "response_body": "{id, title, status}"},
            {"path": "/api/tasks/{id}", "method": "PUT", "description": "Update task status/details", "request_body": "{status, assignee_id, description}", "response_body": "{id, status}"}
        ]
        db_type = "PostgreSQL"
        caching_strategy = "Redis for tracking real-time user presence and active board locks."
        partitioning = "List partitioning on tasks by workspace_id."
        replication = "Primary DB plus 1 hot standby replica for failover."
        caching_type = "Redis"

    elif archetype == "booking_management":
        proj_name = name if any(k in name.lower() for k in ["school", "library", "hospital", "patient", "hotel", "booking", "reservation", "clinic", "appointment"]) else f"{name} (Booking Hub)"
        integrations = ["Twilio SMS API (Reminders)", "Google Maps API (Locations)", "Stripe SDK (Deposits)"]
        actors = ["Service Provider", "Client / Customer", "Office Admin", "SMS Scheduler Daemon"]
        functional_requirements = [
            "Display list of available resources (book slots, rooms, inventory) with real-time status.",
            "Create booking reservations with automatic conflict validation.",
            "Trigger automated email and SMS reminders 24 hours prior to appointment.",
            "Securely settle upfront service deposits or rental fees.",
            "Admin scheduler matrix display to manually balance time slots."
        ]
        tables = [
            {
                "name": "users",
                "columns": ["id (UUID, PK)", "email (VARCHAR, Unique)", "password_hash (VARCHAR)", "phone (VARCHAR)", "role (VARCHAR)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_users_email"],
                "description": "User details including providers and customers."
            },
            {
                "name": "resources",
                "columns": ["id (UUID, PK)", "name (VARCHAR)", "type (VARCHAR, Index)", "status (VARCHAR)", "capacity (INT)"],
                "indexes": ["idx_resources_type"],
                "description": "Bookable rooms, books, or provider time-slots."
            },
            {
                "name": "reservations",
                "columns": ["id (UUID, PK)", "user_id (UUID, FK -> users)", "resource_id (UUID, FK -> resources)", "start_time (TIMESTAMP, Index)", "end_time (TIMESTAMP)", "status (VARCHAR)"],
                "indexes": ["idx_reservations_resource", "idx_reservations_start"],
                "description": "Active bookings with duration fields."
            },
            {
                "name": "billing",
                "columns": ["id (UUID, PK)", "reservation_id (UUID, FK -> reservations)", "amount (DECIMAL)", "status (VARCHAR)", "paid_at (TIMESTAMP)"],
                "indexes": ["idx_billing_reservation"],
                "description": "Financial invoices for booking fees."
            }
        ]
        endpoints = [
            {"path": "/api/auth/register", "method": "POST", "description": "Create customer login", "request_body": "{email, password, phone}", "response_body": "{id, email, token}"},
            {"path": "/api/resources", "method": "GET", "description": "List bookable items", "request_body": "None (Query params: type, status)", "response_body": "{resources: [...]}"},
            {"path": "/api/reservations", "method": "POST", "description": "Book a resource slot", "request_body": "{resource_id, start_time, end_time}", "response_body": "{id, status, start_time}"},
            {"path": "/api/reservations/{id}/cancel", "method": "POST", "description": "Cancel appointment", "request_body": "None", "response_body": "{id, status: 'cancelled'}"},
            {"path": "/api/billing", "method": "GET", "description": "Retrieve invoice stats", "request_body": "None", "response_body": "[{id, amount, status}]"}
        ]
        db_type = "MySQL / RDS"
        caching_strategy = "Memcached cache layer for quick active slot lookups and configuration seeds."
        partitioning = "Range partitioning on reservations by start_time (monthly partitions)."
        replication = "Master-Slave replication topology."
        caching_type = "Memcached"

    elif archetype == "delivery_logistics":
        proj_name = name if any(k in name.lower() for k in ["ride", "uber", "delivery", "taxi", "food", "driver", "passenger", "trip"]) else f"{name} (Logistics Platform)"
        integrations = ["Google Maps Matrix API (Routing)", "Twilio Programmable SMS (Driver updates)", "Stripe Split Payments Engine"]
        actors = ["Passenger / Customer", "Driver / Delivery Agent", "Operations dispatcher", "Map Services Webhook"]
        functional_requirements = [
            "Submit ride/delivery pickup requests with GPS location coordinates.",
            "Real-time driver location tracking using geospatial indexes.",
            "Route distance cost calculation and fare estimates.",
            "Dynamic trip matching algorithms for nearest dispatch agents.",
            "In-app payments with automatic commissions split setup."
        ]
        tables = [
            {
                "name": "users",
                "columns": ["id (UUID, PK)", "email (VARCHAR, Unique)", "password_hash (VARCHAR)", "role (VARCHAR)", "rating (DECIMAL)"],
                "indexes": ["idx_users_email"],
                "description": "System profile roles (drivers vs clients)."
            },
            {
                "name": "vehicles",
                "columns": ["id (UUID, PK)", "driver_id (UUID, FK -> users)", "make (VARCHAR)", "model (VARCHAR)", "license_plate (VARCHAR, Index)"],
                "indexes": ["idx_vehicles_license"],
                "description": "Driver vehicles details."
            },
            {
                "name": "trips",
                "columns": ["id (UUID, PK)", "passenger_id (UUID, FK -> users)", "driver_id (UUID, FK -> users)", "origin (VARCHAR)", "destination (VARCHAR)", "status (VARCHAR)", "price (DECIMAL)"],
                "indexes": ["idx_trips_passenger", "idx_trips_driver"],
                "description": "Trip logs and dispatch statuses."
            },
            {
                "name": "locations",
                "columns": ["id (UUID, PK)", "user_id (UUID, FK -> users)", "latitude (DECIMAL)", "longitude (DECIMAL)", "updated_at (TIMESTAMP)"],
                "indexes": ["idx_locations_user"],
                "description": "Real-time active driver GPS updates."
            }
        ]
        endpoints = [
            {"path": "/api/trips/request", "method": "POST", "description": "Request delivery dispatch", "request_body": "{origin, destination, passenger_id}", "response_body": "{trip_id, status: 'searching', price}"},
            {"path": "/api/trips/{id}/accept", "method": "POST", "description": "Driver accepts trip card", "request_body": "None (Auth driver)", "response_body": "{trip_id, status: 'accepted', passenger_details}"},
            {"path": "/api/trips/{id}/status", "method": "PUT", "description": "Update trip status (arrived, completed)", "request_body": "{status}", "response_body": "{trip_id, status}"},
            {"path": "/api/location/update", "method": "POST", "description": "Send GPS coordinates ping", "request_body": "{latitude, longitude}", "response_body": "{status: 'recorded'}"}
        ]
        db_type = "PostgreSQL (PostGIS)"
        caching_strategy = "Redis Geospatial Indexing (GEOADD/GEORADIUS) for mapping real-time driver coordinates."
        partitioning = "Hash partitioning on trips by passenger_id."
        replication = "Multi-AZ Postgres RDS cluster."
        caching_type = "Redis"

    elif archetype == "saas_analytics":
        proj_name = name if any(k in name.lower() for k in ["saas", "subscription", "billing", "analytics", "dashboard", "invoice"]) else f"{name} (SaaS Hub)"
        integrations = ["Stripe Billing Engine", "Segment Event Collector", "HubSpot CRM Gateway"]
        actors = ["Account Admin", "Team User", "Stripe Webhook Handler", "Analytics Job Runner"]
        functional_requirements = [
            "Organization tenancy management with tiered role controls.",
            "SaaS Plan subscription purchases, upgrades, and cancellations.",
            "Record usage metrics (API pings, storage volume) for billing billing cycles.",
            "Generate usage metrics charts, cost summaries, and analytics downloads.",
            "Manage API tokens for third-party developer integrations."
        ]
        tables = [
            {
                "name": "users",
                "columns": ["id (UUID, PK)", "email (VARCHAR, Unique)", "password_hash (VARCHAR)", "company_name (VARCHAR)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_users_email"],
                "description": "Tenant organization admins."
            },
            {
                "name": "plans",
                "columns": ["id (UUID, PK)", "name (VARCHAR)", "price (DECIMAL)", "billing_interval (VARCHAR)"],
                "indexes": [],
                "description": "Available subscription tiers."
            },
            {
                "name": "subscriptions",
                "columns": ["id (UUID, PK)", "user_id (UUID, FK -> users)", "plan_id (UUID, FK -> plans)", "status (VARCHAR)", "current_period_end (TIMESTAMP, Index)"],
                "indexes": ["idx_subscriptions_user", "idx_subscriptions_end"],
                "description": "Active tenant billing subscription statuses."
            },
            {
                "name": "usage_metrics",
                "columns": ["id (UUID, PK)", "subscription_id (UUID, FK -> subscriptions)", "metric_name (VARCHAR)", "usage_count (INT)", "recorded_at (TIMESTAMP)"],
                "indexes": ["idx_usage_metrics_subscription"],
                "description": "Aggregated usage tallies for metered charges."
            }
        ]
        endpoints = [
            {"path": "/api/subscriptions", "method": "POST", "description": "Create tenant plan checkout", "request_body": "{plan_id}", "response_body": "{checkout_session_url}"},
            {"path": "/api/subscriptions/cancel", "method": "POST", "description": "Cancel active subscription tier", "request_body": "None", "response_body": "{status: 'canceled_at_period_end'}"},
            {"path": "/api/usage", "method": "POST", "description": "Ingest usage metrics data", "request_body": "{metric_name, count}", "response_body": "{status: 'accepted'}"},
            {"path": "/api/metrics", "method": "GET", "description": "Retrieve dashboard charts data", "request_body": "None", "response_body": "{usage_summary: [...], billing_estimate}"}
        ]
        db_type = "PostgreSQL + ClickHouse (for metrics)"
        caching_strategy = "Redis caching for subscription state validations to bypass SQL lookups on every request."
        partitioning = "Timescaled DB/Clickhouse partitions by day for usage metrics."
        replication = "High-availability active-passive setup."
        caching_type = "Redis"

    elif archetype == "ai_agent":
        proj_name = name if any(k in name.lower() for k in ["ai", "llm", "agent", "gpt", "rag", "assistant", "jarvius", "copilot"]) else f"{name} (AI Copilot)"
        integrations = ["OpenAI API SDK", "Pinecone Vector Store", "LangSmith Tracing Core"]
        actors = ["End User", "System Administrator", "AI Worker Daemon", "Vector DB Sync service"]
        functional_requirements = [
            "User session conversation list creation, storage, and retrieval.",
            "Ask questions to AI agent with streaming text chat outputs.",
            "Ingest file context uploads (PDF, Markdown) and trigger vector chunk indexing.",
            "RAG (Retrieval Augmented Generation) pipeline retrieval matching query concepts.",
            "Inspect token usages, LLM latency audits, and billing caps."
        ]
        tables = [
            {
                "name": "users",
                "columns": ["id (UUID, PK)", "email (VARCHAR, Unique)", "password_hash (VARCHAR)", "tier (VARCHAR)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_users_email"],
                "description": "User profiling with account quotas."
            },
            {
                "name": "conversations",
                "columns": ["id (UUID, PK)", "user_id (UUID, FK -> users)", "title (VARCHAR)", "created_at (TIMESTAMP, Index)"],
                "indexes": ["idx_conversations_user", "idx_conversations_created"],
                "description": "User chatbot conversation groups."
            },
            {
                "name": "messages",
                "columns": ["id (UUID, PK)", "conversation_id (UUID, FK -> conversations)", "role (VARCHAR)", "content (TEXT)", "token_count (INT)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_messages_conversation"],
                "description": "Individual prompts and completion messages."
            },
            {
                "name": "knowledge_sources",
                "columns": ["id (UUID, PK)", "user_id (UUID, FK -> users)", "name (VARCHAR)", "file_path (VARCHAR)", "status (VARCHAR)"],
                "indexes": ["idx_sources_user"],
                "description": "Uploaded knowledge base documents."
            }
        ]
        endpoints = [
            {"path": "/api/conversations", "method": "POST", "description": "Create chat conversation thread", "request_body": "{title}", "response_body": "{id, title, created_at}"},
            {"path": "/api/conversations", "method": "GET", "description": "List user chat threads", "request_body": "None", "response_body": "[{id, title}]"},
            {"path": "/api/conversations/{id}/messages", "method": "POST", "description": "Submit prompt message to AI", "request_body": "{content}", "response_body": "{id, role, content}"},
            {"path": "/api/knowledge/upload", "method": "POST", "description": "Upload document for RAG ingestion", "request_body": "{file_binary}", "response_body": "{id, status: 'indexing'}"}
        ]
        db_type = "PostgreSQL + Pinecone"
        caching_strategy = "Redis cache for rapid chat context buffer retrieves and rate limits."
        partitioning = "Range partitioning on messages by conversation_id hash groups."
        replication = "AWS RDS PostgreSQL clustered multi-region instances."
        caching_type = "Redis"

    else:
        # Fallback/Generic Custom
        proj_name = name
        integrations = ["Internal Gateway API", "SendGrid API (Emails)"]
        actors = ["System User", "Service Administrator", "Audit Logs Engine"]
        functional_requirements = [
            "User profile management and secure credentials setup.",
            "Core feature capability and workflows matching user request.",
            "Data ingestion, storage, search and report exporting options."
        ]
        tables = [
            {
                "name": "users",
                "columns": ["id (UUID, PK)", "email (VARCHAR, Unique)", "password_hash (VARCHAR)", "role (VARCHAR)"],
                "indexes": ["idx_users_email"],
                "description": "Stores application user accounts."
            },
            {
                "name": "data_records",
                "columns": ["id (UUID, PK)", "user_id (UUID, FK -> users)", "payload (JSONB)", "created_at (TIMESTAMP)"],
                "indexes": ["idx_records_user"],
                "description": "Stores user-created custom data payloads."
            }
        ]
        endpoints = [
            {"path": "/api/auth/register", "method": "POST", "description": "Create a new user account", "request_body": "{email, password}", "response_body": "{id, email, token}"},
            {"path": "/api/auth/login", "method": "POST", "description": "Authenticate user credentials", "request_body": "{email, password}", "response_body": "{token}"},
            {"path": "/api/records", "method": "POST", "description": "Store custom data payload", "request_body": "{payload: {...}}", "response_body": "{id, user_id, payload, created_at}"}
        ]
        db_type = "PostgreSQL"
        caching_strategy = "Redis caching for active authentication session mappings."
        partitioning = "Single instance setup, no partitioning needed initially."
        replication = "Primary database with local daily snapshot backup schedules."
        caching_type = "Redis"

    # Build SQL Script
    sql_script = "-- Database Schema Initialization\n"
    for table in tables:
        tname = table["name"]
        sql_script += f"CREATE TABLE {tname} (\n"
        cols_sql = []
        for col in table["columns"]:
            col_parts = col.split("(")
            col_name = col_parts[0].strip()
            # simple mapping of type
            type_str = "VARCHAR(255)"
            if "uuid" in col.lower():
                type_str = "UUID"
            elif "timestamp" in col.lower():
                type_str = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            elif "int" in col.lower():
                type_str = "INTEGER"
            elif "decimal" in col.lower():
                type_str = "DECIMAL(10, 2)"
            elif "text" in col.lower():
                type_str = "TEXT"
            elif "jsonb" in col.lower():
                type_str = "JSONB"
            
            constraints = []
            if "pk" in col.lower():
                constraints.append("PRIMARY KEY DEFAULT gen_random_uuid()")
            if "unique" in col.lower():
                constraints.append("UNIQUE NOT NULL")
            if "fk ->" in col.lower():
                target_tbl = col.lower().split("->")[-1].split(")")[0].strip()
                constraints.append(f"REFERENCES {target_tbl}(id) ON DELETE CASCADE")
                
            cols_sql.append(f"    {col_name} {type_str} " + " ".join(constraints))
        sql_script += ",\n".join(cols_sql) + "\n);\n\n"
        for idx in table["indexes"]:
            col_name_idx = idx.replace("idx_" + tname + "_", "")
            sql_script += f"CREATE INDEX {idx} ON {tname}({col_name_idx});\n"
        sql_script += "\n"

    # Build Prisma Schema
    prisma_schema = """datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

"""
    for table in tables:
        tname = table["name"]
        model_name = tname[:-1].capitalize() if tname.endswith("s") else tname.capitalize()
        # manual mapping exceptions
        if model_name == "Follow":
            model_name = "Follower"
        prisma_schema += f"model {model_name} {{\n"
        for col in table["columns"]:
            col_parts = col.split("(")
            col_name = col_parts[0].strip()
            # Map JS naming style
            js_col_name = "".join(x.capitalize() or "_" for x in col_name.split("_"))
            js_col_name = js_col_name[0].lower() + js_col_name[1:]
            
            p_type = "String"
            p_attr = ""
            if "pk" in col.lower():
                p_attr = " @id @default(uuid())"
            elif "timestamp" in col.lower():
                p_type = "DateTime"
                p_attr = " @default(now())"
            elif "int" in col.lower():
                p_type = "Int"
            elif "decimal" in col.lower():
                p_type = "Decimal"
            elif "jsonb" in col.lower():
                p_type = "Json"
                
            if "unique" in col.lower():
                p_attr += " @unique"
                
            prisma_schema += f"  {js_col_name} {p_type}{p_attr}\n"
        prisma_schema += "}\n\n"

    return {
        "archetype": archetype,
        "project_name": proj_name,
        "integrations": integrations,
        "actors": actors,
        "functional_requirements": functional_requirements,
        "tables": tables,
        "endpoints": endpoints,
        "db_type": db_type,
        "caching_strategy": caching_strategy,
        "partitioning": partitioning,
        "replication": replication,
        "caching_type": caching_type,
        "sql_script": sql_script.strip(),
        "prisma_schema": prisma_schema.strip()
    }
