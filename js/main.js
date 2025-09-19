(() => {
  const scrollContainer = document.querySelector('.scroll-container');
  const destCards = Array.from(document.querySelectorAll('.dest-card'));
  if (!scrollContainer || destCards.length === 0) return;

  let currentIndex = 0;
  let autoScroll = null;
  let scrollPauseTimeout = null;

  const scrollToCard = (index) => {
    const card = destCards[index];
    const containerCenter = scrollContainer.offsetWidth / 2;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;

    let targetScroll = cardCenter - containerCenter;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.offsetWidth;
    if (targetScroll < 0) targetScroll = 0;
    if (targetScroll > maxScroll) targetScroll = maxScroll;

    scrollContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    destCards.forEach(c => c.classList.toggle('active', c === card));
  };

  const nextCard = () => {
    currentIndex = (currentIndex + 1) % destCards.length;
    scrollToCard(currentIndex);
  };

  const startAutoScroll = () => {
    stopAutoScroll();
    autoScroll = setInterval(nextCard, 3000);
  };

  const stopAutoScroll = () => {
    if (autoScroll) {
      clearInterval(autoScroll);
      autoScroll = null;
    }
  };

  const getCenteredCardIndex = () => {
    const containerCenter = scrollContainer.scrollLeft + scrollContainer.offsetWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    destCards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });
    return closestIndex;
  };

  scrollContainer.addEventListener('scroll', () => {
    stopAutoScroll();
    if (scrollPauseTimeout) clearTimeout(scrollPauseTimeout);
    scrollPauseTimeout = setTimeout(() => {
      currentIndex = getCenteredCardIndex();
      startAutoScroll();
    }, 3000);
  });

  destCards.forEach((card, idx) => {
    card.addEventListener('mouseenter', () => {
      stopAutoScroll();
      if (scrollPauseTimeout) clearTimeout(scrollPauseTimeout);
      currentIndex = idx; 
    });

    card.addEventListener('mouseleave', () => {
      startAutoScroll(); 
    });
  });

  scrollToCard(currentIndex);
  startAutoScroll();
})();

// ====== Testimonials Carousel ======
const cards = document.querySelectorAll('.testi-card');
const prevBtn = document.querySelector('.carousel-arrow.prev');
const nextBtn = document.querySelector('.carousel-arrow.next');
const dotContainer = document.querySelector('.carousel-dots');
let carouselIndex = 0;

function updateDisplay() {
  cards.forEach((card, i) => {
    card.classList.toggle('active', i === carouselIndex);
  });

  const dots = dotContainer.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === carouselIndex);
  });
}

function createDots() {
  dotContainer.innerHTML = '';
  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');

    dot.addEventListener('click', () => {
      carouselIndex = i;
      updateDisplay();
    });

    dotContainer.appendChild(dot);
  });
}

prevBtn.addEventListener('click', () => {
  carouselIndex = (carouselIndex - 1 + cards.length) % cards.length;
  updateDisplay();
});

nextBtn.addEventListener('click', () => {
  carouselIndex = (carouselIndex + 1) % cards.length;
  updateDisplay();
});

window.addEventListener('load', () => {
  createDots();
  updateDisplay();
});

// ====== CURRENCY CONVERTER ======
(() => {
  const toggleBtn = document.getElementById('toggle-converter');
  const panel = document.getElementById('currency-converter');
  const convertBtn = document.getElementById('convert-btn');
  const fromCurrency = document.getElementById('from-currency');
  const toCurrency = document.getElementById('to-currency');
  const amountInput = document.getElementById('amount');
  const resultDiv = document.getElementById('conversion-result');
  const amountLabel = document.getElementById('amount-label');

  if (!toggleBtn || !panel || !convertBtn || !fromCurrency || !toCurrency || !amountInput || !resultDiv) {
    console.log('Currency converter elements not found:', {
      toggleBtn: !!toggleBtn,
      panel: !!panel,
      convertBtn: !!convertBtn,
      fromCurrency: !!fromCurrency,
      toCurrency: !!toCurrency,
      amountInput: !!amountInput,
      resultDiv: !!resultDiv
    });
    return;
  }

  const rates = {
    USD: { INR: 87.18, EUR: 0.865, GBP: 0.753, JPY: 147.55, USD: 1 },
    INR: { USD: 0.01147, EUR: 0.00992, GBP: 0.00863, JPY: 1.692, INR: 1 },
    EUR: { USD: 1.155, INR: 100.76, GBP: 0.869, JPY: 170.54, EUR: 1 },
    GBP: { USD: 1.328, INR: 115.83, EUR: 1.149, JPY: 196.03, GBP: 1 },
    JPY: { USD: 0.00677, INR: 0.5908, EUR: 0.00586, GBP: 0.0051, JPY: 1 }
  };

  const reset = () => {
    amountLabel.textContent = 'Amount:';
    amountInput.style.display = 'block';
    resultDiv.style.display = 'none';
    resultDiv.textContent = '';
    convertBtn.textContent = 'Convert';
  };

  toggleBtn.addEventListener('click', () => {
    console.log('Currency converter toggle clicked');
    const open = panel.classList.toggle('open');
    console.log('Panel open state:', open);
    toggleBtn.style.display = open ? 'none' : 'block';
    if (!open) {
      toggleBtn.classList.add('bounce');
      setTimeout(() => toggleBtn.classList.remove('bounce'), 600);
    }
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !toggleBtn.contains(e.target) && panel.classList.contains('open')) {
      panel.classList.remove('open');
      toggleBtn.style.display = 'block';
      toggleBtn.classList.add('bounce');
      setTimeout(() => toggleBtn.classList.remove('bounce'), 600);
    }
  });

  convertBtn.addEventListener('click', () => {
    if (convertBtn.textContent === 'Clear') return reset();

    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
      resultDiv.style.display = 'block';
      resultDiv.textContent = 'Enter a valid amount';
      amountInput.style.display = 'none';
      convertBtn.textContent = 'Clear';
      return;
    }

    const rate = rates[from]?.[to];
    if (!rate) {
      resultDiv.style.display = 'block';
      resultDiv.textContent = 'Conversion rate not available';
      amountInput.style.display = 'none';
      convertBtn.textContent = 'Clear';
      return;
    }

    const converted = (amount * rate).toFixed(2);
    amountInput.style.display = 'none';
    resultDiv.style.display = 'block';
    resultDiv.textContent = `${amount} ${from} = ${converted} ${to}`;
    amountLabel.textContent = 'Result:';
    convertBtn.textContent = 'Clear';
  });

  [fromCurrency, toCurrency, amountInput].forEach(el => el.addEventListener('change', reset));
  amountInput.addEventListener('focus', reset);
})();

// ====== BACK TO TOP ======
(() => {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.style.display = window.scrollY > 300 ? 'flex' : 'none');
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ====== WEATHER WIDGET ======
(() => {
  const apiKey = '4a4b2b296cdb1f720ea67892fe69f0da'; 

  const fetchWeather = (city, widget) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
      .then(res => {
        if (!res.ok) throw new Error('City not found');
        return res.json();
      })
      .then(data => {
        const tempC = data.main.temp;
        const cond = data.weather[0].description.toLowerCase();
        const icon = cond.includes('rain') ? '🌧️' :
                     cond.includes('cloud') ? '☁️' :
                     cond.includes('sun') || cond.includes('clear') ? '☀️' :
                     '🌡️';
        widget.innerText = `${icon} ${tempC}°C`;
      })
      .catch(() => widget.innerText = 'N/A');
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.weather-widget').forEach(widget => {
      const city = widget.getAttribute('data-city');
      if (city) fetchWeather(city, widget);
    });
  });
})();

// ====== Q&A DATABASE ======
const qaDatabase = {
  // Greetings
  "hi": "Hi! Welcome to JharkhandTrails! How can I help you plan your perfect trip to Jharkhand?",
  "hello": "Hello! I'm here to help you explore the beautiful destinations of Jharkhand. What would you like to know?",
  "hey": "Hey there! Ready to discover Jharkhand's hidden gems? Ask me about destinations, hotels, or travel planning!",
  
  // Destinations
  "destinations": "Jharkhand offers amazing destinations! Here are the top picks: Dassam Falls, Netarhat, Patratu Valley, Parasnath Hills, Hazaribagh, Ghatshila, and Jamshedpur. Each offers unique experiences from waterfalls to hill stations! <br><br>Choose a place:<br><a href='destination.html?place=dassam-falls' class='chat-link'>Dassam Falls</a> <a href='destination.html?place=netarhat-hill-station' class='chat-link'>Netarhat</a> <a href='destination.html?place=patratu-valley' class='chat-link'>Patratu Valley</a>",
  "places to visit": "Must-visit places in Jharkhand include: Dassam Falls (stunning waterfall), Netarhat (Queen of Chotanagpur), Patratu Valley (scenic beauty), Parasnath Hills (spiritual destination), Hazaribagh (wildlife sanctuary), Ghatshila (mining town), and Jamshedpur (steel city). <br><br>Choose a place:<br><a href='destination.html?place=dassam-falls' class='chat-link'>Dassam Falls</a> <a href='destination.html?place=netarhat-hill-station' class='chat-link'>Netarhat</a> <a href='destination.html?place=patratu-valley' class='chat-link'>Patratu Valley</a>",
  "dassam falls": "Dassam Falls is a magnificent waterfall located near Ranchi. It's about 40km from the capital and offers breathtaking views. Best time to visit is during monsoon (July-September) when the water flow is at its peak.",
  "netarhat": "Netarhat is known as the 'Queen of Chotanagpur' and is a beautiful hill station at 1,100m altitude. It offers cool climate, scenic views, and is perfect for a peaceful retreat. Don't miss the sunset point!",
  "patratu valley": "Patratu Valley is a scenic destination known for its dam and beautiful landscapes. It's perfect for boating, picnics, and enjoying nature. The valley offers stunning views of the surrounding hills.",
  "parasnath hills": "Parasnath Hills is a sacred Jain pilgrimage site and the highest peak in Jharkhand. It's home to beautiful temples and offers panoramic views. The area is also known for its biodiversity.",
  "hazaribagh": "Hazaribagh is famous for its wildlife sanctuary and national park. It's a great destination for nature lovers and wildlife enthusiasts. The town also has historical significance.",
  "ghatshila": "Ghatshila is a charming town known for its mining heritage and natural beauty. It's located on the banks of the Subarnarekha River and offers a peaceful environment.",
  "jamshedpur": "Jamshedpur is the industrial capital of Jharkhand, known as the 'Steel City'. It's well-planned, clean, and offers modern amenities while being close to nature.",
  
  // Hotels and Accommodation
  "hotels": "For accommodation in Jharkhand, you can find various options from budget to luxury. Major cities like Ranchi, Jamshedpur, and Dhanbad have good hotel options. <br><br>🏨 <a href='hotels.html' class='chat-link'>Browse curated hotel recommendations</a>",
  "stay": "Jharkhand offers diverse accommodation options including hotels, resorts, guest houses, and homestays. Popular areas for stays are Ranchi, Jamshedpur, Netarhat, and Hazaribagh. <br><br>🏨 <a href='hotels.html' class='chat-link'>Find your perfect stay</a>",
  "accommodation": "You can find accommodation ranging from budget hotels to luxury resorts. Major cities have good connectivity and accommodation options. For hill stations like Netarhat, advance booking is recommended. <br><br>🏨 <a href='hotels.html' class='chat-link'>View accommodation options</a>",
  
  // Travel Planning
  "plan": "I can help you plan your Jharkhand trip! Use our Travel Planning tool to create a custom itinerary. Consider factors like season, duration, interests, and budget. <br><br>📅 <a href='planning.html' class='chat-link'>Create your custom itinerary</a>",
  "itinerary": "For a perfect Jharkhand itinerary, I recommend: Day 1-2: Ranchi and Dassam Falls, Day 3-4: Netarhat hill station, Day 5-6: Patratu Valley and Hazaribagh, Day 7: Jamshedpur. Adjust based on your interests! <br><br>📅 <a href='planning.html' class='chat-link'>Plan your detailed itinerary</a>",
  "trip": "Planning a trip to Jharkhand? Consider visiting during October-March for pleasant weather. Must-see destinations include waterfalls, hill stations, and wildlife sanctuaries. <br><br>📅 <a href='planning.html' class='chat-link'>Use our planning tool</a>",
  "travel": "Jharkhand is well-connected by road, rail, and air. Ranchi has an airport, and major cities are connected by trains. Road trips are popular for exploring the scenic routes. <br><br>📅 <a href='planning.html' class='chat-link'>Plan your travel route</a>",
  
  // Flights and Transportation
  "flights": "For flights to Jharkhand, Ranchi Airport (IXR) is the main airport with connections to major Indian cities. You can also reach via Patna or Kolkata airports and then travel by road or rail. <br><br>✈️ <a href='VOC/booking.html' class='chat-link'>Book your flights</a>",
  "book": "You can book flights, hotels, and other travel services through our VOC (Virtual Operations Center) section. We provide comprehensive booking assistance for your Jharkhand trip. <br><br>✈️ <a href='VOC/booking.html' class='chat-link'>Access booking portal</a>",
  "transportation": "Jharkhand has good connectivity via road, rail, and air. State transport buses, private buses, and trains connect major cities. For remote destinations, local transport or private vehicles are recommended. <br><br>✈️ <a href='VOC/booking.html' class='chat-link'>Book transportation</a>",
  
  // Weather and Best Time
  "weather": "Jharkhand has a tropical climate. Best time to visit is October-March (winter) when the weather is pleasant. Monsoon (July-September) is good for waterfalls but can be humid.",
  "best time": "The best time to visit Jharkhand is during winter (October-March) when the weather is cool and pleasant. Summer can be hot, and monsoon brings heavy rains but beautiful waterfalls.",
  "season": "Jharkhand has three main seasons: Summer (March-June), Monsoon (July-September), and Winter (October-February). Winter is ideal for sightseeing, monsoon for waterfalls.",
  
  // General Information
  "jharkhand": "Jharkhand is a beautiful state in eastern India known for its rich tribal culture, natural beauty, waterfalls, hill stations, and wildlife. It's often called the 'Land of Forests' and offers diverse experiences for travelers.",
  "culture": "Jharkhand has a rich tribal culture with over 30 indigenous communities. The state is known for its traditional festivals, handicrafts, music, and dance forms. Don't miss the local cuisine and cultural experiences!",
  "food": "Jharkhand offers delicious local cuisine including rice-based dishes, tribal food, and traditional sweets. Try local delicacies like litti-chokha, thekua, and various tribal preparations.",
  "shopping": "Jharkhand is famous for its handicrafts including bamboo products, wooden crafts, tribal jewelry, and traditional textiles. Major shopping areas are in Ranchi, Jamshedpur, and local markets near tourist destinations. <br><br>🛍️ <a href='destination.html' class='chat-link'>Find shopping spots near destinations</a>",
  
  // Help and Support
  "help": "I'm here to help you with information about Jharkhand destinations, hotels, travel planning, flights, weather, culture, and more. Just ask me anything about your Jharkhand trip! <br><br>📞 <a href='VOC/helpline.html' class='chat-link'>Contact our helpline</a>",
  "support": "For detailed assistance, you can use our Travel Planning tool, check the Hotels page, or contact our helpline. I'm here to answer your questions about Jharkhand tourism! <br><br>📞 <a href='VOC/helpline.html' class='chat-link'>Get support</a>",
  "contact": "For direct contact and support, you can reach us through our helpline or contact information available on the website. We're here to help make your Jharkhand trip memorable and hassle-free. <br><br>📞 <a href='VOC/helpline.html' class='chat-link'>Contact us</a>",
  
  // Emergency and Safety
  "emergency": "🚨 EMERGENCY CONTACTS\n\nIf you're in immediate danger or need emergency assistance, please contact:\n\n🚔 Police Helpline: 100\n🚑 Ambulance Service: 108\n👶 Child Helpline: 1098\n👩 Women Helpline: 181\n\nThese numbers are available 24/7. Please call immediately if you need help!",
  "safety": "For your safety in Jharkhand, always inform someone about your travel plans, keep emergency contacts handy, and avoid isolated areas at night. In case of emergency, call: Police (100), Ambulance (108), Child Helpline (1098), Women Helpline (181).",
  "lost": "If you're lost in Jharkhand, stay calm and try to reach a safe, public area. Contact local police (100) or ask for help from nearby shops/hotels. Keep your phone charged and share your location with trusted contacts.",
  
  // Default responses
  "default": "I'd love to help you with your Jharkhand travel plans! You can ask me about destinations, hotels, travel planning, weather, culture, or anything else related to exploring Jharkhand. <br><br>🔗 Quick links:<br><a href='destination.html' class='chat-link'>Destinations</a> <a href='hotels.html' class='chat-link'>Hotels</a> <a href='planning.html' class='chat-link'>Planning</a> <a href='VOC/booking.html' class='chat-link'>Booking</a>"
};

async function callGemini(userText) {
	const apiKey = 'AIzaSyAWpFle4i1lxT7AtNMCwy1d_QH1zP9bNbg';
	if (!apiKey) {
		console.error('Missing Gemini API key');
		return 'I could not access the AI service right now.';
	}

	try {
		const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [
					{ role: 'user', parts: [{ text: userText }] }
				]
			})
		});

		if (!res.ok) {
			const errorText = await res.text();
			console.error('Gemini API HTTP error:', res.status, errorText);
			return 'Sorry, I could not get an answer right now.';
		}

		const data = await res.json();
		const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a helpful answer.';
		return text;
	} catch (err) {
		console.error('Gemini API error:', err);
		return 'Sorry, something went wrong while contacting the AI.';
	}
}

// Function to check for emergency situations
function checkForEmergency(question) {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Emergency keywords that might indicate distress or need for help
  const emergencyKeywords = [
    'help me', 'emergency', 'urgent', 'danger', 'unsafe', 'scared', 'afraid', 'frightened',
    'lost', 'stranded', 'stuck', 'trapped', 'accident', 'injury', 'hurt', 'injured',
    'sick', 'ill', 'medical', 'hospital', 'ambulance', 'police', 'crime', 'theft',
    'harassment', 'abuse', 'violence', 'threat', 'attack', 'kidnap', 'missing',
    'suicide', 'depressed', 'anxiety', 'panic', 'crisis', 'distress', 'trouble',
    'problem', 'issue', 'stuck', 'can\'t', 'cannot', 'need help', 'save me',
    'rescue', 'evacuate', 'evacuation', 'disaster', 'flood', 'fire', 'earthquake'
  ];
  
  // Check if any emergency keywords are present
  for (const keyword of emergencyKeywords) {
    if (lowerQuestion.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

// Function to get emergency contacts response
function getEmergencyResponse() {
  return `🚨 EMERGENCY CONTACTS

If you're in immediate danger or need emergency assistance, please contact:

🚔 Police Helpline: 100
🚑 Ambulance Service: 108
👶 Child Helpline: 1098
👩 Women Helpline: 181

These numbers are available 24/7. Please call immediately if you need help!

For non-emergency travel assistance, I'm still here to help with your Jharkhand trip planning.`;
}

// Function to find the best answer for a given question
function findAnswer(question) {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Check for emergency situations first
  if (checkForEmergency(lowerQuestion)) {
    return getEmergencyResponse();
  }
  
  // Direct matches first
  if (qaDatabase[lowerQuestion]) {
    return qaDatabase[lowerQuestion];
  }
  
  // Keyword-based matching
  for (const [key, answer] of Object.entries(qaDatabase)) {
    if (key !== 'default' && lowerQuestion.includes(key)) {
      return answer;
    }
  }
  
  // Return default response
  return qaDatabase.default;
}

// ====== CHATBOT WIDGET ======
(() => {
  const toggleBtn = document.getElementById('toggle-chatbot');
  const panel = document.getElementById('chatbot');
  const messagesEl = document.getElementById('chatbot-messages');
  const inputEl = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  let aiFollowupMode = false;

  if (!toggleBtn || !panel || !messagesEl || !inputEl || !sendBtn) {
    console.log('Chatbot elements not found:', {
      toggleBtn: !!toggleBtn,
      panel: !!panel,
      messagesEl: !!messagesEl,
      inputEl: !!inputEl,
      sendBtn: !!sendBtn
    });
    return;
  }

  const appendMessage = (text, who) => {
    const div = document.createElement('div');
    div.className = `chat-msg ${who}`;
    if (who === 'bot' && text.includes('<a href=') && !text.includes('🚨 EMERGENCY')) {
      div.innerHTML = text;
    } else {
      // Handle line breaks for emergency responses
      if (text.includes('\n')) {
        div.innerHTML = text.replace(/\n/g, '<br>');
      } else {
        div.textContent = text;
      }
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };






  const botReply = (text) => {
    return findAnswer(text);
  };

  const handleSend = async () => {
    const text = inputEl.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    inputEl.value = '';
    const lowerText = text.toLowerCase().trim();
    
    // Remove recommendation topics after first user message
    const suggestionRow = panel.querySelector('.chatbot-suggestion-row');
    if (suggestionRow) {
      suggestionRow.remove();
    }
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg bot typing';
    typingDiv.textContent = 'Typing...';
    messagesEl.appendChild(typingDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    // If AI follow-up mode is enabled, route everything to AI
    if (aiFollowupMode) {
      const aiPrompt = `You are JharkhandTrails' travel assistant for Jharkhand, India.
Only answer questions directly related to Jharkhand tourism: destinations, hotels, local transport, weather, best time to visit, culture, safety, itineraries, and travel planning within Jharkhand. But answer every question related to Jharkhand places or any that includes Jharkhand's places.
If the question is outside Jharkhand tourism or not relevant, reply exactly: "Sorry, I'm not able to understand. Please ask about Jharkhand tourism." Do not add anything else.
Be concise and helpful. Prefer factual, current guidance. If unsure, say so.

Website context: JharkhandTrails features guides for Dassam Falls, Netarhat, Patratu Valley, Parasnath Hills, Hazaribagh, Ghatshila, Jamshedpur, Baidyanath Temple, Trikut Hill, Konar Dam, Burudi Lake; has pages: destinations (destination.html), hotels (hotels.html), planning (planning.html), booking (VOC/booking.html), and helpline (VOC/helpline.html).
Use short sentences and do not include markdown code fences.

User question: ${text}`;
      const response = await callGemini(aiPrompt);
      typingDiv.remove();
      appendMessage(response, 'bot');
      return;
    }
    // Try hardcoded QA first
    const localAnswer = botReply(text);
    const isDefaultAnswer = localAnswer === qaDatabase.default;
    const isEmergencyAnswer = localAnswer.includes('EMERGENCY CONTACTS');

    if (!isDefaultAnswer || isEmergencyAnswer) {
      // Use the local answer if matched or emergency
      setTimeout(() => {
        typingDiv.remove();
        appendMessage(localAnswer, 'bot');
        // Inline follow-up text (no separate card/button)
        const lastMsg = messagesEl.lastElementChild;
        if (lastMsg && lastMsg.classList.contains('bot')) {
          const followup = document.createElement('div');
          followup.className = 'ai-followup-inline';
          followup.style.marginTop = '8px';
          followup.style.fontSize = '12px';
          followup.style.cursor = 'pointer';
          followup.style.display = 'inline-block';
          followup.style.padding = '4px 8px';
          followup.style.borderRadius = '999px';
          followup.style.background = '#f0f4ff';
          followup.style.border = '1px solid #d6e4ff';
          followup.style.color = '#1a3cff';
          followup.style.fontWeight = '600';
          followup.setAttribute('role', 'button');
          followup.setAttribute('tabindex', '0');
          followup.textContent = '🤖 Still need help? Ask a follow-up';
          followup.addEventListener('click', () => {
            aiFollowupMode = true;
            while (messagesEl.childElementCount > 1) {
              messagesEl.removeChild(messagesEl.lastElementChild);
            }
            inputEl.focus();
          });
          followup.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              followup.click();
            }
          });
          lastMsg.appendChild(followup);
        }
      }, 300);
      return;
    }

    // Fallback to AI with website context and strict out-of-scope response
    const aiPrompt = `You are JharkhandTrails' travel assistant for Jharkhand, India.
Only answer questions directly related to Jharkhand tourism: destinations, hotels, local transport, weather, best time to visit, culture, safety, itineraries, and travel planning within Jharkhand.
If the question is outside Jharkhand tourism or not relevant, reply exactly: "Sorry, I'm not able to understand. Please ask about Jharkhand tourism." Do not add anything else.
Be concise and helpful. Prefer factual, current guidance. If unsure, say so.

Website context: JharkhandTrails features guides for Dassam Falls, Netarhat, Patratu Valley, Parasnath Hills, Hazaribagh, Ghatshila, Jamshedpur, Baidyanath Temple, Trikut Hill, Konar Dam, Burudi Lake; has pages: destinations (destination.html), hotels (hotels.html), planning (planning.html), booking (VOC/booking.html), and helpline (VOC/helpline.html).
Use short sentences and do not include markdown code fences.

User question: ${text}`;

    const response = await callGemini(aiPrompt);
    typingDiv.remove();
    appendMessage(response, 'bot');
  };

  const maybeInjectGreeting = () => {
    if (messagesEl.childElementCount === 0) {
      appendMessage('Hi! How can I help today? You can ask about:', 'bot');
      // quick suggestions
      ['Top destinations', 'Find hotels', 'Flight options', 'Other'].forEach(s => {
        const chip = document.createElement('span');
        chip.className = 'chatbot-suggestion';
        const label = document.createElement('span');
        label.textContent = s;
        const close = document.createElement('button');
        close.className = 'chip-close';
        close.setAttribute('aria-label', 'Dismiss suggestion');
        close.textContent = '×';

        label.addEventListener('click', () => {
          // If "Other" is clicked, clear all suggestions and switch to plain chat
          if (s.toLowerCase() === 'other') {
            const row = panel.querySelector('.chatbot-suggestion-row');
            if (row) row.remove();
            inputEl.focus();
            return;
          }
          inputEl.value = s;
          handleSend();
        });
        close.addEventListener('click', (e) => {
          e.stopPropagation();
          chip.remove();
        });

        chip.appendChild(label);
        chip.appendChild(close);

        // wrap chips row container
        let row = panel.querySelector('.chatbot-suggestion-row');
        if (!row) {
          row = document.createElement('div');
          row.className = 'chatbot-suggestion-row';
          panel.insertBefore(row, panel.querySelector('.chatbot-input-row'));
        }
        row.appendChild(chip);
      });
    }
  };

  toggleBtn.addEventListener('click', () => {
    console.log('Chatbot toggle clicked');
    const open = panel.classList.toggle('open');
    console.log('Chatbot panel open state:', open);
    if (open) {
      maybeInjectGreeting();
      inputEl.focus();
    } else {
      toggleBtn.classList.add('bounce');
      setTimeout(() => toggleBtn.classList.remove('bounce'), 500);
    }
  });

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
})();

// ====== SUBSCRIBE FORM ======
(() => {
  const form = document.getElementById('subscribe-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const msg = document.getElementById('subscription-msg');
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (regex.test(email)) {
      msg.style.display = 'block';
      msg.style.color = 'green';
      msg.textContent = 'Thank you for subscribing!';
      form.reset();
    } else {
      msg.style.display = 'block';
      msg.style.color = 'red';
      msg.textContent = 'Please enter a valid email address.';
    }
    setTimeout(() => msg.style.display = 'none', 3000);
  });
})();


