# MainBranch API Documentation

Base URL: `/api`

## Authentication (`/auth`)

| Method | Endpoint | Description | Body Params | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/github` | Authenticate with GitHub | `code` | No |
| POST | `/register` | Register new user | `username`, `email`, `password` | No |
| POST | `/login` | Login user | `username`, `email`, `password` | No |
| GET | `/me` | Get current user profile | - | **Yes** |

## Users (`/users`)

| Method | Endpoint | Description | Body Params | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/:username` | Get public user profile | - | No |
| PUT | `/profile` | Update user profile | `displayName`, `bio`, `skills`, `socials` | **Yes** |
| PUT | `/services` | Update integration usernames | `github`, `leetcode`, `kaggle`, `huggingface` | **Yes** |
| POST | `/sync` | Trigger manual stats sync | - | **Yes** |
| POST | `/projects` | Add new project | `title`, `description`, `link`, `tags`, `image` | **Yes** |

## Posts (`/posts`)

| Method | Endpoint | Description | Body Params | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | Get global feed | - | **Yes** |
| POST | `/` | Create new post | `content` | **Yes** |
| PUT | `/:id/like` | Like/Unlike post | - | **Yes** |
| POST | `/:id/comments` | Add comment | `content` | **Yes** |
| DELETE | `/:id` | Delete post | - | **Yes** |

## Chat (`/chat`)

| Method | Endpoint | Description | Body Params | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/conversations` | Get active conversations | - | **Yes** |
| GET | `/:userId` | Get messages with user | - | **Yes** |
| POST | `/` | Send message | `recipientId`, `content`, `image` (multipart) | **Yes** |
| PUT | `/:userId/read` | Mark messages as read | - | **Yes** |

## Integrations (`/integrations`)

| Method | Endpoint | Description | Body Params | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/verify/github` | Verify GitHub username | `username` | **Yes** |
| POST | `/verify/leetcode` | Verify LeetCode username | `username` | **Yes** |
| POST | `/verify/kaggle` | Verify Kaggle username | `username` | **Yes** |
| POST | `/verify/huggingface` | Verify Hugging Face username | `username` | **Yes** |

## Uploads (`/upload`)

| Method | Endpoint | Description | Body Params | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/` | Upload generic file/image | `image` (multipart) | **Yes** |
