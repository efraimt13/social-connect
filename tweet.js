// Function to handle posting a tweet from main or popup
function postTweet(content = '', media = '') {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    const tweetInput = document.getElementById('tweetInput');
    const mediaPreview = document.getElementById('mediaPreview');

    const tweetContent = content || tweetInput?.value.trim();
    const tweetMedia = media || mediaPreview?.innerHTML;

    if (!tweetContent && !tweetMedia) return;

    const tweet = {
        content: tweetContent,
        media: tweetMedia,
        userName: userData?.displayName || "Unknown User",
        handle: userData?.handle || "@unknown",
        profilePicture: userData?.profilePicture || "default-pic.jpg",
        timestamp: new Date().toISOString(),
        likes: 0,
        retweets: 0,
        comments: [] // Initialize an empty comments array
    };

    const tweets = JSON.parse(localStorage.getItem("tweets")) || [];
    tweets.unshift(tweet); // Add new tweet to the beginning of the array
    localStorage.setItem("tweets", JSON.stringify(tweets));

    renderTweets(); // Refresh the feed
    if (!content && tweetInput) {
        tweetInput.value = ''; // Clear input field
        mediaPreview.innerHTML = ''; // Clear media preview
    }
}





function renderTweets() {
    const tweetFeed = document.getElementById("tweetFeed");
    if (!tweetFeed) {
        console.error("Tweet feed element not found.");
        return;
    }

    const tweets = JSON.parse(localStorage.getItem("tweets")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    tweetFeed.innerHTML = ""; // Clear the feed

    if (!tweets.length) {
        tweetFeed.innerHTML = "<p>No tweets to display.</p>";
        return;
    }

    tweets.forEach(tweet => {
        const user = users.find(u => u.handle === tweet.handle) || {
            displayName: "Unknown User",
            profilePicture: "default-pic.jpg",
            handle: "@unknown"
        };

        const tweetElement = document.createElement("div");
        tweetElement.className = "tweet";
        tweetElement.innerHTML = `
            <div class="tweet-header">
                <div class="profile-pic" style="background-image: url('${user.profilePicture}')"></div>
                <span class="username">${user.displayName}</span>
                <span class="handle">${user.handle}</span>
                <span class="timestamp">${new Date(tweet.timestamp).toLocaleString()}</span>
            </div>
            <div class="tweet-content">${tweet.content}</div>
            <div class="tweet-actions">
                <button 
                    class="${tweet.likesBy?.includes(loggedInUser?.handle) ? "liked" : ""}" 
                    onclick="likeTweet('${tweet.timestamp}')"
                >
                    <i class="fas fa-heart"></i> <span>${tweet.likes || 0}</span>
                </button>
                <button 
                    class="${tweet.retweetsBy?.includes(loggedInUser?.handle) ? "retweeted" : ""}" 
                    onclick="retweet('${tweet.timestamp}')"
                >
                    <i class="fas fa-retweet"></i> <span>${tweet.retweets || 0}</span>
                </button>
                <button onclick="showComments('${tweet.timestamp}')">
                    <i class="fas fa-comment"></i> <span>${tweet.comments.length || 0}</span>
                </button>
            </div>
        `;
        tweetFeed.appendChild(tweetElement);
    });
}




function showComments(timestamp) {
    const tweetElement = document.querySelector(`.tweet[data-timestamp='${timestamp}']`);
    if (!tweetElement) {
        console.error("Tweet element not found for timestamp:", timestamp);
        return;
    }

    const commentSectionId = `comments-section-${timestamp}`;
    const commentSection = document.getElementById(commentSectionId);

    if (commentSection) {
        // Toggle visibility
        commentSection.style.display = commentSection.style.display === "none" ? "block" : "none";
        return;
    }

    const tweets = JSON.parse(localStorage.getItem("tweets")) || [];
    const tweet = tweets.find(t => t.timestamp === timestamp);

    if (tweet) {
        const newCommentSection = document.createElement("div");
        newCommentSection.id = commentSectionId;
        newCommentSection.className = "comments-section";

        newCommentSection.innerHTML = `
            <div class="comments">
                ${tweet.comments
                    .map(
                        comment => `
                        <div class="comment">
                            <div class="comment-avatar" style="background-image: url('${comment.userProfileImage || "default-pic.jpg"}')"></div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="username">${comment.user}</span>
                                    <span class="timestamp">${comment.timestamp}</span>
                                </div>
                                <div class="comment-text">${comment.text}</div>
                            </div>
                        </div>
                    `
                    )
                    .join("")}
            </div>
            <textarea class="comment-input" placeholder="Write a comment..."></textarea>
            <button onclick="postComment('${timestamp}')">Post</button>
        `;

        tweetElement.appendChild(newCommentSection);
    }
}


function postComment(tweetId) {
    const tweets = JSON.parse(localStorage.getItem("tweets")) || [];
    const tweetIndex = tweets.findIndex(t => t.id === tweetId);
    const commentInput = document.querySelector(`#comments-section-${tweetId} .comment-input`);
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("Please log in to comment.");
        return;
    }

    if (tweetIndex !== -1 && commentInput.value.trim()) {
        const comment = {
            user: loggedInUser.displayName,
            userProfileImage: loggedInUser.profilePicture || "default-pic.jpg",
            text: commentInput.value.trim(),
            timestamp: new Date().toLocaleTimeString()
        };

        tweets[tweetIndex].comments.push(comment);
        localStorage.setItem("tweets", JSON.stringify(tweets));

        commentInput.value = ""; // Clear input
        renderTweets(); // Refresh tweets to show the new comment
    }
}






function toggleCommentSection(tweetId) {
    const commentSection = document.getElementById(`comments-section-${tweetId}`);
    if (commentSection) {
        commentSection.style.display =
            commentSection.style.display === "none" ? "block" : "none";
    }
}




// Function to toggle the options menu
function toggleOptions(index) {
    const menu = document.getElementById(`options-menu-${index}`);
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';

    // Hide menu when clicking outside
    document.addEventListener('click', function closeMenu(event) {
        if (!menu.contains(event.target) && event.target.className !== 'options') {
            menu.style.display = 'none';
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Function to delete a tweet
function deleteTweet(index) {
    const tweets = JSON.parse(localStorage.getItem("tweets")) || [];
    tweets.splice(index, 1);
    localStorage.setItem("tweets", JSON.stringify(tweets));
    renderTweets();
}

function likeTweet(timestamp) {
    const tweets = JSON.parse(localStorage.getItem("tweets")) || [];
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const tweet = tweets.find(t => t.timestamp === timestamp);

    if (tweet) {
        // Initialize likesBy if not present
        tweet.likesBy = tweet.likesBy || [];

        // Check if user has already liked the tweet
        if (tweet.likesBy.includes(loggedInUser.handle)) {
            // Unlike the tweet
            tweet.likesBy = tweet.likesBy.filter(handle => handle !== loggedInUser.handle);
            tweet.likes--;
        } else {
            // Like the tweet
            tweet.likesBy.push(loggedInUser.handle);
            tweet.likes++;
        }

        localStorage.setItem("tweets", JSON.stringify(tweets));
        renderTweets(); // Refresh feed
    }
}





// Function to handle retweets
function retweet(timestamp) {
    const tweets = JSON.parse(localStorage.getItem("tweets")) || [];
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const originalTweet = tweets.find(t => t.timestamp === timestamp);

    if (originalTweet && loggedInUser) {
        // Check if already retweeted
        if (originalTweet.retweetsBy?.includes(loggedInUser.handle)) {
            alert("You have already retweeted this!");
            return;
        }

        // Add retweet
        const retweet = {
            ...originalTweet,
            isRetweet: true,
            retweetedBy: loggedInUser.handle,
            timestamp: new Date().toISOString(),
            likes: 0,
            retweets: 0,
        };

        // Track retweets
        originalTweet.retweetsBy = originalTweet.retweetsBy || [];
        originalTweet.retweetsBy.push(loggedInUser.handle);
        tweets.unshift(retweet);
        localStorage.setItem("tweets", JSON.stringify(tweets));

        renderTweets(); // Refresh feed
    }
}





// Set file size limit (in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Display media preview in main tweet box with Clear Media button
function displayMediaPreview(event) {
    const mediaPreview = document.getElementById('mediaPreview');
    mediaPreview.innerHTML = ''; // Clear previous media
    const files = event.target.files;

    for (const file of files) {
        const fileURL = URL.createObjectURL(file);
        const mediaElement = file.type.startsWith("video")
            ? `<video src="${fileURL}" controls style="max-width: 100%; max-height: 200px; margin-top: 10px;"></video>`
            : `<img src="${fileURL}" style="max-width: 100%; max-height: 200px; margin-top: 10px;">`;

        mediaPreview.innerHTML += `<div class="media-container">${mediaElement}<div class="clear-media-btn" onclick="clearMediaFields('tweetInput', 'mediaPreview')">×</div></div>`;
    }
}


// Emoji Picker for Tweet Input
function showEmojiPicker() {
    const emojiPicker = new EmojiMart.Picker({
        onEmojiSelect: emoji => {
            const tweetInput = document.getElementById('tweetInput');
            tweetInput.value += emoji.native;
        }
    });

    const pickerContainer = document.createElement('div');
    pickerContainer.className = 'emoji-picker';
    pickerContainer.appendChild(emojiPicker);
    document.body.appendChild(pickerContainer);

    document.addEventListener('click', function(event) {
        if (!pickerContainer.contains(event.target)) {
            pickerContainer.remove();
        }
    }, { once: true });
}

// Function to share a tweet
function shareTweet() {
    navigator.clipboard.writeText("Check out this tweet!").then(() => {
        alert("Tweet link copied to clipboard!");
    });
}

// Suggestions for Search Input
const suggestions = ["John Doe", "Jane Smith", "JavaScript Guru", "Web Dev Weekly", "ReactJS Tips", "CSS Tricks"];

function showSuggestions() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsCard = document.getElementById('suggestionsCard');
    const query = searchInput.value.toLowerCase();

    suggestionsCard.innerHTML = '';
    suggestionsCard.style.display = query ? 'block' : 'none';

    suggestions.filter(item => item.toLowerCase().includes(query)).forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = item;

        suggestionItem.onclick = () => {
            searchInput.value = item;
            suggestionsCard.style.display = 'none';
        };

        suggestionsCard.appendChild(suggestionItem);
    });
}

// Refresh Trends
function refreshTrends() {
    const trends = [
        { category: 'Tech', hashtag: '#AI', tweets: '76.2k' },
        { category: 'Politics', hashtag: '#DebateNight', tweets: '134.5k' },
        { category: 'Entertainment', hashtag: '#MovieRelease', tweets: '82.1k' },
        { category: 'Sports', hashtag: '#ChampionsLeague', tweets: '92.3k' },

    ];

    const trendSection = document.querySelector('.trending-section');
    trendSection.innerHTML = '<h3>Trends for you <button onclick="refreshTrends()"><i class="fa-solid fa-retweet"></i></button></h3>';

    trends.forEach(trend => {
        const trendDiv = document.createElement('div');
        trendDiv.classList.add('trend');
        trendDiv.innerHTML = `
            <span class="trend-category">Trending in ${trend.category}</span>
            <h4>${trend.hashtag}</h4>
            <p>${trend.tweets} Tweets</p>
        `;
        trendSection.appendChild(trendDiv);
    });
}

// Scroll to Top Functionality
window.onscroll = () => {
    document.getElementById('scrollToTop').style.display = window.scrollY > 300 ? 'block' : 'none';
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initial setup on page load
document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    if (userData) {
        document.getElementById("tweetBoxProfilePic").style.backgroundImage = `url(${userData.profilePicture})`;
        renderTweets();
    }
    refreshTrends(); // Load initial trends on page load
});


// Function to open the Tweet popup
function openTweetPopup() {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    const profilePicElement = document.getElementById('popupProfilePic');

    // Set user's profile picture in the popup
    profilePicElement.style.backgroundImage = `url('${userData.profilePicture}')`;

    document.getElementById('tweetPopup').style.display = 'block';
}

// Function to close the Tweet popup
function closeTweetPopup() {
    document.getElementById('tweetPopup').style.display = 'none';
    clearPopupFields();
}

// General function to clear input fields and media previews
function clearMediaFields(inputId, previewId) {
    if (inputId) document.getElementById(inputId).value = '';
    if (previewId) document.getElementById(previewId).innerHTML = '';
    locationText = '';  // Reset location text, if applicable
}

// Usage for tweet popup card
clearMediaFields('popupTweetInput', 'popupMediaPreview');

// Usage for main tweet box
clearMediaFields('tweetInput', 'mediaPreview');


// Function to post a tweet from the popup
let locationText = '';  // Variable to store location text

function postPopupTweet() {
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    const tweetInput = document.getElementById('popupTweetInput');
    const tweetContent = tweetInput.value.trim();
    const popupMediaPreview = document.getElementById('popupMediaPreview');

    if (!tweetContent && !popupMediaPreview.innerHTML) return;

    // Clone the media preview content to filter out close buttons
    const mediaClone = popupMediaPreview.cloneNode(true);
    const closeButtons = mediaClone.querySelectorAll('.media-close-btn');
    closeButtons.forEach(btn => btn.remove()); // Remove all close buttons

    const tweet = {
        content: tweetContent,
        media: mediaClone.innerHTML, // Save the filtered media HTML
        userName: userData.displayName,
        handle: userData.handle,
        profilePicture: userData.profilePicture,
        timestamp: new Date().toISOString(),
        likes: 0,
        retweets: 0,
        comments: []
    };

    // Add the new tweet to local storage
    const tweets = JSON.parse(localStorage.getItem("tweets")) || [];
    tweets.unshift(tweet);
    localStorage.setItem("tweets", JSON.stringify(tweets));

    // Clear input fields and close the popup
    closeTweetPopup();
    tweetInput.value = '';
    popupMediaPreview.innerHTML = '';

    // Immediately refresh the feed to show the new tweet
    renderTweets();
}




// Display media preview in tweet popup
function displayPopupMediaPreview(event) {
    const mediaPreview = document.getElementById('popupMediaPreview');
    mediaPreview.innerHTML = '';
    const files = event.target.files;

    for (const file of files) {
        if (!file.type.startsWith("image") && !file.type.startsWith("video")) {
            alert("Only images and videos are allowed.");
            continue;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert("File size exceeds 5MB. Please select a smaller file.");
            continue;
        }

        const fileURL = URL.createObjectURL(file);
        const mediaElement = file.type.startsWith("video")
            ? `<video src="${fileURL}" controls></video>`
            : `<img src="${fileURL}">`;

        mediaPreview.innerHTML += mediaElement;
    }
}

// Function to get the user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            locationText = `Lat: ${position.coords.latitude}, Long: ${position.coords.longitude}`;
            alert("Location added to tweet.");
        }, error => {
            alert("Unable to retrieve location.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}




function showUserSuggestions() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsCard = document.getElementById('suggestionsCard');
    const query = searchInput.value.toLowerCase();

    suggestionsCard.innerHTML = '';
    suggestionsCard.style.display = query ? 'block' : 'none';

    if (!query) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const filteredUsers = users.filter(user => 
        user.displayName.toLowerCase().includes(query) || user.handle.toLowerCase().includes(query)
    );

    filteredUsers.forEach(user => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';

        suggestionItem.innerHTML = `
            <div class="suggestion-profile-pic" style="background-image: url('${user.profilePicture}')"></div>
            <div>
                <span class="suggestion-username">${user.displayName}</span>
                <span class="suggestion-handle">${user.handle}</span>
            </div>
        `;

        suggestionItem.onclick = () => {
            viewUserProfile(user);
            suggestionsCard.style.display = 'none';
        };

        suggestionsCard.appendChild(suggestionItem);
    });
}


function viewUserProfile(user) {
    localStorage.setItem("selectedUserProfile", JSON.stringify(user));
    window.location.href = "profile.html";
}
document.addEventListener("DOMContentLoaded", () => {
    const selectedUserProfile = JSON.parse(localStorage.getItem("selectedUserProfile"));

    if (selectedUserProfile) {
        document.getElementById("profilePicture").src = selectedUserProfile.profilePicture || "default-pic.jpg";
        document.getElementById("coverPhoto").src = selectedUserProfile.coverPhoto || "cover-default.jpg";
        document.getElementById("displayName").textContent = selectedUserProfile.displayName || "Username";
        document.getElementById("handle").textContent = selectedUserProfile.handle || "@userhandle";
        
        loadUserTweets(selectedUserProfile.handle); // Load only this user’s tweets
    } else {
        // Fallback if no profile is found
        document.getElementById("displayName").textContent = "User not found";
    }
});

// Function to get trending hashtags from tweets
function getTrendingHashtags() {
    const tweets = JSON.parse(localStorage.getItem("tweets")) || [];
    const hashtagCounts = {};

    tweets.forEach(tweet => {
        const hashtags = tweet.content.match(/#\w+/g); // Extract hashtags
        if (hashtags) {
            hashtags.forEach(tag => {
                hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1; // Count occurrences
            });
        }
    });

    // Sort hashtags by count and return top 5
    return Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hashtag, count]) => ({ hashtag, count }));
}

// Function to display trending hashtags in the sidebar
function displayTrendingHashtags() {
    const trendSection = document.querySelector('.trending-section');
    const trendingHashtags = getTrendingHashtags();

    trendSection.innerHTML = '<h3>Trending Hashtags</h3>';
    trendingHashtags.forEach(({ hashtag, count }) => {
        const trendDiv = document.createElement('div');
        trendDiv.className = 'trend';
        trendDiv.innerHTML = `
            <h4>${hashtag}</h4>
            <p>${count} Tweets</p>
        `;
        trendSection.appendChild(trendDiv);
    });
}

// Call function on page load and periodically to refresh trends
document.addEventListener("DOMContentLoaded", displayTrendingHashtags);
setInterval(displayTrendingHashtags, 60000); // Refresh every minute

// Function to save profile data uniquely for each user
function saveProfile(event) {
    event.preventDefault();
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    const userHandle = loggedInUser.handle;
    const profileDataKey = `profileData_${userHandle}`;

    // Get form values
    const bio = document.getElementById("bioInput").value;
    const profilePicInput = document.getElementById("profilePicInput").files[0];
    const coverPhotoInput = document.getElementById("coverPhotoInput").files[0];

    // Prepare user profile object to store
    let userProfile = JSON.parse(localStorage.getItem(profileDataKey)) || {};
    userProfile.handle = userHandle;
    userProfile.bio = bio;

    // If a new profile picture is uploaded, update it
    if (profilePicInput) {
        const reader = new FileReader();
        reader.onload = () => {
            userProfile.profilePicture = reader.result;
            localStorage.setItem(profileDataKey, JSON.stringify(userProfile));
            loadProfileData();
        };
        reader.readAsDataURL(profilePicInput);
    }

    // If a new cover photo is uploaded, update it
    if (coverPhotoInput) {
        const reader = new FileReader();
        reader.onload = () => {
            userProfile.coverPhoto = reader.result;
            localStorage.setItem(profileDataKey, JSON.stringify(userProfile));
            loadProfileData();
        };
        reader.readAsDataURL(coverPhotoInput);
    }

    // Save bio and any other updates
    localStorage.setItem(profileDataKey, JSON.stringify(userProfile));
    closeEditProfileModal();
}

// Function to load profile data for the logged-in user
function loadProfileData() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    const userHandle = loggedInUser.handle;
    const profileDataKey = `profileData_${userHandle}`;
    const userProfile = JSON.parse(localStorage.getItem(profileDataKey)) || {};

    // Update profile page elements with loaded data
    document.getElementById("profilePicture").src = userProfile.profilePicture || "default-pic.jpg";
    document.getElementById("coverPhoto").src = userProfile.coverPhoto || "cover-default.jpg";
    document.getElementById("displayName").textContent = userProfile.displayName || "Username";
    document.getElementById("handle").textContent = userHandle;
    document.getElementById("bio").textContent = userProfile.bio || "User's bio goes here.";
}

// Preview image before saving
function previewImage(event, previewId) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        document.getElementById(previewId).src = reader.result;
    };
    if (file) reader.readAsDataURL(file);
}

// Call loadProfileData on page load
document.addEventListener("DOMContentLoaded", () => {
    loadProfileData();
});



function loadUserTweets(userHandle) {
    const user = users.find(u => u.handle === userHandle);
    if (!user || !user.tweets) return;

    tweetFeed.innerHTML = ''; // Clear existing tweets

    // Filter and render only the tweets of the selected or logged-in user
    user.tweets.forEach(tweet => {
        const tweetElement = document.createElement('div');
        tweetElement.className = 'tweet';

        tweetElement.innerHTML = `
            <div class="tweet">
                <div class="tweet-header">
                    <div class="profile-pic" style="background-image: url('${user.profilePicture}')"></div>
                    <span class="username">${user.displayName}</span>
                    <span class="handle">${user.handle}</span>
                </div>
                <div class="tweet-content">${tweet.content}</div>
            </div>
        `;
        tweetFeed.appendChild(tweetElement);
    });
}



document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
        const userData = JSON.parse(localStorage.getItem(loggedInUser.username));
        if (userData && userData.profilePicture) {
            document.getElementById("tweetBoxProfilePic").style.backgroundImage = `url(${userData.profilePicture})`;
        }
    }
    renderTweets();
});
function openTweetPopup() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const userData = JSON.parse(localStorage.getItem(loggedInUser.username));
    const profilePicElement = document.getElementById('popupProfilePic');

    if (userData && userData.profilePicture) {
        profilePicElement.style.backgroundImage = `url('${userData.profilePicture}')`;
    }

    document.getElementById('tweetPopup').style.display = 'block';
}

document.addEventListener("DOMContentLoaded", () => {
    loadWhoToFollow(); // Call on the home page
    loadProfileData(); // Call on the profile page
});




function loadWhoToFollow() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        console.error("No logged-in user found.");
        return;
    }

    const whoToFollowSection = document.querySelector(".who-to-follow");
    whoToFollowSection.innerHTML = "<h3>Who to follow</h3>";

    // Ensure `followingList` exists and is an array
    const currentUser = users.find(user => user.username === loggedInUser.username);
    if (!currentUser.followingList) {
        currentUser.followingList = [];
    }

    // Filter users to exclude logged-in user and already followed users
    const suggestions = users.filter(user =>
        user.username !== loggedInUser.username && !currentUser.followingList.includes(user.username)
    );

    suggestions.forEach(user => {
        const followSuggestion = document.createElement("div");
        followSuggestion.className = "follow-suggestion";
        followSuggestion.innerHTML = `
            <div class="profile-pic-suggestion" style="background-image: url('${user.profilePicture || "default-pic.jpg"}')"></div>
            <div class="follow-info">
                <span class="username">${user.displayName || "Unknown User"}</span>
                <span class="handle">@${user.handle || "unknown"}</span>
                <button class="follow-button" onclick="followUser('${user.username}')">Follow</button>
            </div>
        `;
        whoToFollowSection.appendChild(followSuggestion);
    });
}

function followUser(followedUsername) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("You need to log in to follow users.");
        return;
    }

    const followedUser = users.find(user => user.username === followedUsername);
    const currentUser = users.find(user => user.username === loggedInUser.username);

    if (!followedUser || !currentUser) {
        console.error("User data not found.");
        return;
    }

    // Add the followed user to the current user's following list
    if (!currentUser.followingList.includes(followedUsername)) {
        currentUser.followingList.push(followedUsername);
        currentUser.following = (currentUser.following || 0) + 1;

        // Increment followers count for the followed user
        followedUser.followers = (followedUser.followers || 0) + 1;

        // Save updated data to `localStorage`
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("loggedInUser", JSON.stringify(currentUser));

        // Refresh the "Who to Follow" section
        loadWhoToFollow();

        alert(`You are now following ${followedUser.displayName || followedUser.handle}`);
    } else {
        alert("You are already following this user.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadWhoToFollow();
});

function loadProfileData() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const profileData = JSON.parse(localStorage.getItem("users")).find(user => user.username === loggedInUser.username);

    document.getElementById("profilePicture").src = profileData.profilePicture || "default-pic.jpg";
    document.getElementById("coverPhoto").src = profileData.coverPhoto || "cover-default.jpg";
    document.getElementById("displayName").textContent = profileData.displayName;
    document.getElementById("handle").textContent = profileData.handle;
    document.getElementById("bio").textContent = profileData.bio;
    document.getElementById("joinDate").textContent = profileData.joinDate || "Joined Date";
    document.getElementById("followingCount").textContent = profileData.following;
    document.getElementById("followersCount").textContent = profileData.followers;
}




function loadProfileData() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    const userData = JSON.parse(localStorage.getItem(loggedInUser.username));
    document.getElementById("profilePicture").src = userData?.profilePicture || "default-pic.jpg";
    document.getElementById("tweetBoxProfilePic").style.backgroundImage = `url(${userData?.profilePicture || "default-pic.jpg"})`;
}

document.addEventListener("DOMContentLoaded", () => {
    loadProfileData();
    updateProfileTitle();
});






















































































