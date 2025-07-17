// Blog management functions

// Get all blog posts from storage
function getBlogPosts() {
    const postsStr = localStorage.getItem('blogPosts');
    return postsStr ? JSON.parse(postsStr) : [];
}

// Save blog posts to storage
function saveBlogPosts(posts) {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Create a new blog post
function createBlogPost(title, content) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return { success: false, error: 'You must be logged in to create a post' };
    }
    
    const posts = getBlogPosts();
    
    const post = {
        id: generateId(),
        title: title.trim(),
        content: content.trim(),
        author: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    posts.unshift(post); // Add to beginning for latest-first order
    saveBlogPosts(posts);
    
    return { success: true, post: post };
}

// Delete a blog post
function deleteBlogPost(postId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return { success: false, error: 'You must be logged in to delete a post' };
    }
    
    const posts = getBlogPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
        return { success: false, error: 'Post not found' };
    }
    
    const post = posts[postIndex];
    
    // Check if user owns the post
    if (post.author.id !== currentUser.id) {
        return { success: false, error: 'You can only delete your own posts' };
    }
    
    posts.splice(postIndex, 1);
    saveBlogPosts(posts);
    
    return { success: true };
}

// Load and display blog posts
function loadBlogPosts() {
    const postsContainer = document.getElementById('postsContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const emptyState = document.getElementById('emptyState');
    
    if (!postsContainer) return;
    
    // Show loading
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Clear existing posts
    const existingPosts = postsContainer.querySelectorAll('.post-card');
    existingPosts.forEach(post => post.remove());
    
    const posts = getBlogPosts();
    
    // Hide loading
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    if (posts.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }
    
    // Display posts
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
    
    // Update post count
    updatePostCount(posts.length);
}

// Create a post element
function createPostElement(post) {
    const currentUser = getCurrentUser();
    const isOwner = currentUser && currentUser.id === post.author.id;
    
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';
    postDiv.innerHTML = `
        <div class="post-header">
            <div>
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    <span><i class="fas fa-user"></i> ${escapeHtml(post.author.name)}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(post.createdAt)}</span>
                </div>
            </div>
            <div class="post-actions">
                ${isOwner ? `
                    <button class="btn btn-danger" onclick="handleDeletePost('${post.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        </div>
        <div class="post-content">${escapeHtml(post.content)}</div>
    `;
    
    return postDiv;
}

// Handle create post form submission
function handleCreatePost(e) {
    e.preventDefault();
    
    clearFormErrors();
    
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    
    // Validation
    let hasErrors = false;
    
    if (!title) {
        document.getElementById('titleError').textContent = 'Title is required';
        hasErrors = true;
    } else if (title.length < 3) {
        document.getElementById('titleError').textContent = 'Title must be at least 3 characters';
        hasErrors = true;
    } else if (title.length > 200) {
        document.getElementById('titleError').textContent = 'Title must be less than 200 characters';
        hasErrors = true;
    }
    
    if (!content) {
        document.getElementById('contentError').textContent = 'Content is required';
        hasErrors = true;
    } else if (content.length < 10) {
        document.getElementById('contentError').textContent = 'Content must be at least 10 characters';
        hasErrors = true;
    } else if (content.length > 10000) {
        document.getElementById('contentError').textContent = 'Content must be less than 10,000 characters';
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Create post
    const result = createBlogPost(title, content);
    
    if (result.success) {
        showFormMessage('Post created successfully! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showFormMessage(result.error);
    }
}

// Handle delete post
function handleDeletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }
    
    const result = deleteBlogPost(postId);
    
    if (result.success) {
        showNotification('Post deleted successfully', 'success');
        loadBlogPosts(); // Reload posts
    } else {
        showNotification(result.error, 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    alert(message);
}

// Update post count display
function updatePostCount(count) {
    const feedStats = document.getElementById('feedStats');
    if (feedStats) {
        const postCountElement = feedStats.querySelector('.post-count');
        if (postCountElement) {
            postCountElement.textContent = `${count} ${count === 1 ? 'post' : 'posts'}`;
        }
    }
}
// finished