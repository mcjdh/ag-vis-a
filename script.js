class AlgorithmVisualizer {
    constructor() {
        this.mode = 'single';
        this.canvas = document.getElementById('visualization-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.array = [];
        this.isRunning = false;
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        
        // Race mode properties
        this.raceCanvases = new Map();
        this.raceArrays = new Map();
        this.raceResults = [];
        this.raceStartTime = 0;
        this.finishedAlgorithms = new Set();
        
        // Performance tracking
        this.performanceData = new Map();
        this.operationsChart = null;
        this.progressChart = null;
        this.customData = null;
        this.customDataErrorEl = document.getElementById('custom-data-error');
        
        // Animation settings
        this.barWidth = 0;
        this.barSpacing = 2;
        this.maxHeight = 300;
        this.speed = 100;
        
        // Enhanced features
        this.soundEnabled = true;
        this.particleEffects = true;
        this.raceProgressBars = new Map();
        
        // Colors for different states
        this.colors = {
            default: '#667eea',
            comparing: '#ff6b6b',
            swapping: '#4ecdc4',
            sorted: '#95e1d3',
            pivot: '#f38ba8',
            current: '#a8e6cf',
            finished: '#ffd93d'
        };
        
        // Algorithm color themes for race mode
        this.algorithmColors = {
            bubble: { primary: '#ff6b6b', secondary: '#ff8e8e' },
            selection: { primary: '#4ecdc4', secondary: '#7ed5d0' },
            insertion: { primary: '#45b7d1', secondary: '#73c7dd' },
            merge: { primary: '#96ceb4', secondary: '#b2d8c4' },
            quick: { primary: '#ffeaa7', secondary: '#ffef9f' },
            heap: { primary: '#dda0dd', secondary: '#e6b8e6' }
        };
        
        // Constants for custom data
        this.CUSTOM_DATA_MIN_VALUE = 10;
        this.CUSTOM_DATA_MAX_VALUE = 190;
        this.CUSTOM_DATA_MAX_HEIGHT_RACE = 180;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.generateArray();
        this.updateAlgorithmInfo('bubble');
        this.initializeAudioContext();
    }
    
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
            this.soundEnabled = false;
        }
    }
    
    playSound(frequency, duration = 100) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (e) {
            // Silently fail if audio context is not available
        }
    }
    
    setupCanvas() {
        if (this.mode === 'single') {
            const container = this.canvas.parentElement;
            const containerWidth = container.clientWidth - 60;
            this.canvas.width = containerWidth;
            this.canvas.height = this.maxHeight + 60;
            this.canvas.style.background = 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)';
        }
    }
    
    setupEventListeners() {
        // Mode selection
        document.getElementById('mode-select').addEventListener('change', (e) => {
            this.switchMode(e.target.value);
        });
        
        // Controls
        document.getElementById('algorithm-select').addEventListener('change', (e) => {
            this.updateAlgorithmInfo(e.target.value);
        });
        
        document.getElementById('array-size').addEventListener('input', (e) => {
            document.getElementById('size-value').textContent = e.target.value;
            if (!this.isRunning) {
                this.generateArray();
            }
        });
        
        document.getElementById('speed-control').addEventListener('input', (e) => {
            const speedLabels = ['Slowest', 'Slow', 'Slow', 'Medium', 'Medium', 'Medium', 'Fast', 'Fast', 'Faster', 'Fastest'];
            document.getElementById('speed-value').textContent = speedLabels[e.target.value - 1];
            this.speed = 11 - parseInt(e.target.value);
        });
        
        document.getElementById('generate-btn').addEventListener('click', () => {
            if (!this.isRunning) {
                this.generateArray();
            }
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startVisualization();
        });
        
        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stopVisualization();
        });
        
        document.getElementById('custom-data-btn').addEventListener('click', () => {
            this.toggleCustomInput();
        });
        
        document.getElementById('charts-btn').addEventListener('click', () => {
            this.togglePerformanceCharts();
        });
        
        document.getElementById('apply-custom-data').addEventListener('click', () => {
            this.applyCustomData();
        });
        
        document.getElementById('data-pattern').addEventListener('change', (e) => {
            if (e.target.value) {
                this.generatePatternData(e.target.value);
            }
        });
        
        // Race mode algorithm checkboxes
        document.querySelectorAll('#race-algorithms-group input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (!this.isRunning) {
                    this.setupRaceMode();
                }
            });
        });
        
        // Responsive canvas
        window.addEventListener('resize', () => {
            if (!this.isRunning) {
                this.setupCanvas();
                if (this.mode === 'single') {
                    this.draw();
                } else {
                    this.setupRaceMode();
                }
            }
        });
    }
    
    switchMode(newMode) {
        if (this.isRunning) return;
        
        this.mode = newMode;
        const singleGroup = document.getElementById('single-algorithm-group');
        const raceGroup = document.getElementById('race-algorithms-group');
        const infoPanel = document.getElementById('info-panel');
        const raceResults = document.getElementById('race-results');
        const startBtn = document.getElementById('start-btn');
        
        if (newMode === 'race') {
            singleGroup.style.display = 'none';
            raceGroup.style.display = 'block';
            this.setupRaceMode();
            startBtn.textContent = 'Start Race!';
            infoPanel.style.display = 'none';
            document.getElementById('custom-data-btn').style.display = 'inline-block';
            document.getElementById('charts-btn').style.display = 'inline-block';
        } else {
            singleGroup.style.display = 'block';
            raceGroup.style.display = 'none';
            this.setupSingleMode();
            startBtn.textContent = 'Start Visualization';
            infoPanel.style.display = 'grid';
            raceResults.style.display = 'none';
            document.getElementById('custom-data-btn').style.display = 'none';
            document.getElementById('charts-btn').style.display = 'none';
            document.getElementById('performance-charts').style.display = 'none';
            document.getElementById('custom-input').style.display = 'none';
        }
    }
    
    setupSingleMode() {
        const canvasContainer = document.getElementById('canvas-container');
        canvasContainer.innerHTML = '<canvas id="visualization-canvas"></canvas>';
        this.canvas = document.getElementById('visualization-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.generateArray();
    }
    
    setupRaceMode() {
        const canvasContainer = document.getElementById('canvas-container');
        canvasContainer.innerHTML = '<div class="race-canvases" id="race-canvases"></div>';
        
        const raceCanvasesContainer = document.getElementById('race-canvases');
        const checkboxes = document.querySelectorAll('#race-algorithms-group input[type="checkbox"]');
        
        this.raceCanvases.clear();
        this.raceArrays.clear();
        this.raceProgressBars.clear();
        this.finishedAlgorithms.clear();
        raceCanvasesContainer.innerHTML = '';
        
        const selectedAlgorithms = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        
        if (selectedAlgorithms.length === 0) {
            raceCanvasesContainer.innerHTML = '<div class="no-algorithms">Please select at least one algorithm to race!</div>';
            return;
        }
        
        selectedAlgorithms.forEach(algorithm => {
            const algorithmColor = this.algorithmColors[algorithm];
            const canvasItem = document.createElement('div');
            canvasItem.className = 'race-canvas-item';
            canvasItem.innerHTML = `
                <div class="algorithm-header">
                    <div class="algorithm-title" style="color: ${algorithmColor.primary}">${this.getAlgorithmName(algorithm)}</div>
                    <div class="progress-container">
                        <div class="progress-bar" id="progress-${algorithm}">
                            <div class="progress-fill" style="background: linear-gradient(90deg, ${algorithmColor.primary}, ${algorithmColor.secondary});"></div>
                        </div>
                        <div class="progress-text" id="progress-text-${algorithm}">0%</div>
                    </div>
                </div>
                <canvas class="canvas-race" id="canvas-${algorithm}"></canvas>
                <div class="race-stats">
                    <div>⚡ <span id="comp-${algorithm}">0</span> comparisons</div>
                    <div>🔄 <span id="swap-${algorithm}">0</span> swaps</div>
                    <div>⏱️ <span id="time-${algorithm}">0ms</span></div>
                </div>
            `;
            
            raceCanvasesContainer.appendChild(canvasItem);
            
            const canvas = document.getElementById(`canvas-${algorithm}`);
            const ctx = canvas.getContext('2d');
            
            // Dynamic canvas sizing based on container width
            const containerWidth = Math.min(400, (window.innerWidth - 100) / selectedAlgorithms.length);
            canvas.width = containerWidth;
            canvas.height = 250;
            canvas.style.background = `linear-gradient(180deg, ${algorithmColor.secondary}20 0%, ${algorithmColor.primary}10 100%)`;
            
            this.raceCanvases.set(algorithm, { 
                canvas, 
                ctx, 
                element: canvasItem,
                colors: algorithmColor 
            });
            
            // Initialize progress bar
            this.raceProgressBars.set(algorithm, {
                element: document.getElementById(`progress-${algorithm}`),
                text: document.getElementById(`progress-text-${algorithm}`),
                value: 0
            });
        });
        
        this.generateArray();
    }
    
    getAlgorithmName(algorithm) {
        const names = {
            bubble: 'Bubble Sort',
            selection: 'Selection Sort',
            insertion: 'Insertion Sort',
            merge: 'Merge Sort',
            quick: 'Quick Sort',
            heap: 'Heap Sort'
        };
        return names[algorithm];
    }
    
    generateArray() {
        const size = parseInt(document.getElementById('array-size').value);
        
        if (this.mode === 'single') {
            this.array = [];
            
            if (this.customData && this.customData.length > 0) {
                this.customData.forEach(value => {
                    this.array.push({
                        value: value,
                        state: 'default'
                    });
                });
            } else {
                for (let i = 0; i < size; i++) {
                    this.array.push({
                        value: Math.floor(Math.random() * (this.maxHeight - 20)) + 10,
                        state: 'default'
                    });
                }
            }
            this.resetStats();
            this.calculateBarWidth();
            this.draw();
        } else {
            // Race mode - generate same array for all algorithms
            let baseArray = [];
            
            if (this.customData && this.customData.length > 0) {
                baseArray = [...this.customData];
            } else {
                for (let i = 0; i < size; i++) {
                    baseArray.push(Math.floor(Math.random() * this.CUSTOM_DATA_MAX_HEIGHT_RACE) + this.CUSTOM_DATA_MIN_VALUE);
                }
            }
            
            this.raceCanvases.forEach((canvasData, algorithm) => {
                const array = baseArray.map(value => ({ value, state: 'default' }));
                this.raceArrays.set(algorithm, array);
                this.drawRace(algorithm);
                
                // Reset progress
                const progressData = this.raceProgressBars.get(algorithm);
                if (progressData) {
                    progressData.value = 0;
                    this.updateProgressBar(algorithm, 0);
                }
            });
            
            this.raceResults = [];
            this.finishedAlgorithms.clear();
            document.getElementById('race-results').style.display = 'none';
            
            // Clear charts if they exist
            if (this.operationsChart) {
                this.clearCharts();
            }
        }
    }
    
    calculateBarWidth() {
        if (this.array.length === 0) return;
        const totalSpacing = (this.array.length - 1) * this.barSpacing;
        this.barWidth = Math.max(2, (this.canvas.width - totalSpacing - 40) / this.array.length);
    }
    
    resetStats() {
        this.comparisons = 0;
        this.swaps = 0;
        this.updateStats();
    }
    
    updateStats() {
        if (this.mode === 'single') {
            document.getElementById('comparisons').textContent = this.comparisons;
            document.getElementById('swaps').textContent = this.swaps;
            
            if (this.startTime) {
                const elapsed = Date.now() - this.startTime;
                document.getElementById('time').textContent = elapsed + 'ms';
            }
        }
    }
    
    updateRaceStats(algorithm, comparisons, swaps, time) {
        document.getElementById(`comp-${algorithm}`).textContent = comparisons;
        document.getElementById(`swap-${algorithm}`).textContent = swaps;
        document.getElementById(`time-${algorithm}`).textContent = time + 'ms';
    }
    
    updateProgressBar(algorithm, percentage) {
        const progressData = this.raceProgressBars.get(algorithm);
        if (!progressData) return;
        
        progressData.value = percentage;
        const fill = progressData.element.querySelector('.progress-fill');
        const text = progressData.text;
        
        if (fill && text) {
            fill.style.width = percentage + '%';
            text.textContent = Math.round(percentage) + '%';
        }
    }
    
    updateAlgorithmInfo(algorithm) {
        const info = {
            bubble: {
                name: 'Bubble Sort',
                description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
                timeComplexity: 'O(n²)',
                spaceComplexity: 'O(1)'
            },
            selection: {
                name: 'Selection Sort',
                description: 'Finds the minimum element from the unsorted portion and places it at the beginning. Repeats until the entire array is sorted.',
                timeComplexity: 'O(n²)',
                spaceComplexity: 'O(1)'
            },
            insertion: {
                name: 'Insertion Sort',
                description: 'Builds the final sorted array one item at a time. It takes elements from the unsorted portion and inserts them into their correct position.',
                timeComplexity: 'O(n²)',
                spaceComplexity: 'O(1)'
            },
            merge: {
                name: 'Merge Sort',
                description: 'A divide-and-conquer algorithm that divides the array into halves, sorts them separately, and then merges them back together.',
                timeComplexity: 'O(n log n)',
                spaceComplexity: 'O(n)'
            },
            quick: {
                name: 'Quick Sort',
                description: 'A divide-and-conquer algorithm that picks a pivot element and partitions the array around it, then recursively sorts the sub-arrays.',
                timeComplexity: 'O(n log n)',
                spaceComplexity: 'O(log n)'
            },
            heap: {
                name: 'Heap Sort',
                description: 'Uses a binary heap data structure. First builds a max-heap, then repeatedly extracts the maximum element and places it at the end.',
                timeComplexity: 'O(n log n)',
                spaceComplexity: 'O(1)'
            }
        };
        
        const current = info[algorithm];
        document.getElementById('algo-name').textContent = current.name;
        document.getElementById('algo-description').textContent = current.description;
        document.getElementById('time-complexity').textContent = current.timeComplexity;
        document.getElementById('space-complexity').textContent = current.spaceComplexity;
    }
    
    draw() {
        if (this.mode !== 'single' || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        let x = 20;
        for (let i = 0; i < this.array.length; i++) {
            const bar = this.array[i];
            const height = bar.value;
            const y = this.canvas.height - height - 30;
            
            // Create gradient based on state
            let gradient = this.ctx.createLinearGradient(0, y, 0, y + height);
            const color = this.colors[bar.state];
            
            gradient.addColorStop(0, this.lightenColor(color, 20));
            gradient.addColorStop(1, color);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, this.barWidth, height);
            
            // Add subtle border
            this.ctx.strokeStyle = this.darkenColor(color, 10);
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, this.barWidth, height);
            
            // Add value label for smaller arrays
            if (this.array.length <= 20) {
                this.ctx.fillStyle = '#333';
                this.ctx.font = '10px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(bar.value, x + this.barWidth / 2, this.canvas.height - 10);
            }
            
            x += this.barWidth + this.barSpacing;
        }
    }
    
    drawRace(algorithm) {
        const canvasData = this.raceCanvases.get(algorithm);
        const array = this.raceArrays.get(algorithm);
        
        if (!canvasData || !array) return;
        
        const { canvas, ctx, colors } = canvasData;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = Math.max(2, (canvas.width - 40) / array.length);
        const barSpacing = 1;
        
        let x = 20;
        for (let i = 0; i < array.length; i++) {
            const bar = array[i];
            const maxHeight = canvas.height - 40;
            const height = Math.max(2, (bar.value / this.CUSTOM_DATA_MAX_HEIGHT_RACE) * maxHeight);
            const y = canvas.height - height - 20;
            
            // Use algorithm-specific colors
            let color;
            if (bar.state === 'comparing') {
                color = '#ff6b6b';
            } else if (bar.state === 'swapping') {
                color = '#4ecdc4';
            } else if (bar.state === 'sorted') {
                color = colors.primary;
            } else {
                color = colors.secondary;
            }
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, y, 0, y + height);
            gradient.addColorStop(0, this.lightenColor(color, 20));
            gradient.addColorStop(1, color);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, height);
            
            // Add subtle border
            ctx.strokeStyle = this.darkenColor(color, 10);
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, barWidth, height);
            
            x += barWidth + barSpacing;
        }
        
        // Add finishing animation if completed
        if (this.finishedAlgorithms.has(algorithm)) {
            this.addFinishingAnimation(ctx, canvas, colors);
        }
    }
    
    addFinishingAnimation(ctx, canvas, colors) {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
        );
        gradient.addColorStop(0, colors.primary + '20');
        gradient.addColorStop(1, colors.primary + '05');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add "FINISHED!" text
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('FINISHED!', canvas.width / 2, 30);
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
    
    async startVisualization() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.raceStartTime = Date.now();
        
        // Update button states
        document.getElementById('start-btn').disabled = true;
        document.getElementById('stop-btn').disabled = false;
        document.getElementById('generate-btn').disabled = true;
        
        try {
            if (this.mode === 'single') {
                this.resetStats();
                const algorithm = document.getElementById('algorithm-select').value;
                
                await this.runSingleAlgorithm(algorithm, this.array);
                
                // Mark all as sorted
                for (let bar of this.array) {
                    bar.state = 'sorted';
                }
                this.draw();
                
                // Play completion sound
                this.playSound(800, 200);
                
            } else {
                // Race mode - run all selected algorithms simultaneously
                this.raceResults = [];
                this.finishedAlgorithms.clear();
                const promises = [];
                
                // Validate we have algorithms to race
                if (this.raceCanvases.size === 0) {
                    throw new Error('No algorithms selected for race');
                }
                
                this.raceCanvases.forEach((canvasData, algorithm) => {
                    promises.push(this.runRaceAlgorithm(algorithm));
                });
                
                await Promise.allSettled(promises);
                this.showRaceResults();
            }
        } catch (error) {
            console.log('Visualization stopped or error occurred:', error.message);
        } finally {
            this.stopVisualization();
        }
    }
    
    async runRaceAlgorithm(algorithm) {
        const array = this.raceArrays.get(algorithm);
        if (!array) {
            throw new Error(`Array not found for algorithm: ${algorithm}`);
        }
        
        const startTime = Date.now();
        const totalElements = array.length;
        let sortedElements = 0;
        
        // Create a race-specific context for algorithm execution
        const raceContext = {
            array: array.map(item => ({ ...item })), // Deep copy
            comparisons: 0,
            swaps: 0,
            algorithm: algorithm,
            updateStats: () => {
                this.updateRaceStats(algorithm, raceContext.comparisons, raceContext.swaps, Date.now() - startTime);
            },
            updateProgress: (sorted) => {
                sortedElements = sorted;
                const percentage = (sortedElements / totalElements) * 100;
                this.updateProgressBar(algorithm, percentage);
            },
            draw: () => {
                // Update the actual array reference
                this.raceArrays.set(algorithm, raceContext.array);
                this.drawRace(algorithm);
            },
            sleep: async (ms = null) => {
                if (!this.isRunning) throw new Error('Stopped');
                const delay = ms || Math.max(1, this.speed * 2); // Faster for race mode
                return new Promise(resolve => setTimeout(resolve, delay));
            },
            playSound: (frequency) => {
                this.playSound(frequency, 50);
            }
        };
        
        try {
            await this.runSingleAlgorithm(algorithm, raceContext.array, raceContext);
            
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            
            // Mark as finished
            for (let bar of raceContext.array) {
                bar.state = 'sorted';
            }
            this.raceArrays.set(algorithm, raceContext.array);
            this.finishedAlgorithms.add(algorithm);
            this.drawRace(algorithm);
            
            // Update progress to 100%
            this.updateProgressBar(algorithm, 100);
            
            // Mark canvas as finished
            const canvasData = this.raceCanvases.get(algorithm);
            if (canvasData) {
                canvasData.element.classList.add('finished');
            }
            
            // Play finish sound
            this.playSound(600 + this.raceResults.length * 100, 300);
            
            // Add to results
            this.raceResults.push({
                algorithm,
                name: this.getAlgorithmName(algorithm),
                time: totalTime,
                comparisons: raceContext.comparisons,
                swaps: raceContext.swaps,
                position: this.raceResults.length + 1
            });
            
        } catch (error) {
            if (error.message !== 'Stopped') {
                console.error(`Error in ${algorithm}:`, error);
            }
            throw error;
        }
    }
    
    showRaceResults() {
        // Sort results by time
        this.raceResults.sort((a, b) => a.time - b.time);
        
        const raceResultsDiv = document.getElementById('race-results');
        const leaderboard = document.getElementById('race-leaderboard');
        
        leaderboard.innerHTML = '';
        
        this.raceResults.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = `leaderboard-item ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`;
            
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            const algorithmColor = this.algorithmColors[result.algorithm];
            
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="medal">${medal}</span>
                    <div class="algorithm-indicator" style="width: 20px; height: 20px; background: ${algorithmColor.primary}; border-radius: 50%;"></div>
                    <span class="algorithm-name">${result.name}</span>
                </div>
                <div style="text-align: right;">
                    <div class="algorithm-time">${result.time}ms</div>
                    <div style="font-size: 0.8rem; color: #666;">
                        ${result.comparisons} comparisons, ${result.swaps} swaps
                    </div>
                </div>
            `;
            
            leaderboard.appendChild(item);
            
            // Animate the appearance
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        raceResultsDiv.style.display = 'block';
        
        // Play victory fanfare
        setTimeout(() => this.playVictoryFanfare(), 500);
    }
    
    playVictoryFanfare() {
        if (!this.soundEnabled) return;
        
        const notes = [523, 659, 784, 1047]; // C, E, G, C
        notes.forEach((note, index) => {
            setTimeout(() => this.playSound(note, 300), index * 150);
        });
    }
    
    stopVisualization() {
        this.isRunning = false;
        
        // Reset button states
        document.getElementById('start-btn').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        document.getElementById('generate-btn').disabled = false;
        
        // Reset states
        if (this.mode === 'single') {
            for (let bar of this.array) {
                if (bar.state !== 'sorted') {
                    bar.state = 'default';
                }
            }
            this.draw();
        } else {
            this.raceCanvases.forEach((canvasData, algorithm) => {
                const array = this.raceArrays.get(algorithm);
                if (array) {
                    for (let bar of array) {
                        if (bar.state !== 'sorted') {
                            bar.state = 'default';
                        }
                    }
                    canvasData.element.classList.remove('finished');
                    this.drawRace(algorithm);
                }
            });
        }
    }
    
    async sleep(ms = null) {
        if (!this.isRunning) throw new Error('Stopped');
        const delay = ms || this.speed * 10;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    
    async runSingleAlgorithm(algorithm, array, context = null) {
        const ctx = context || {
            array: array,
            comparisons: 0,
            swaps: 0,
            updateStats: () => {
                this.comparisons = ctx.comparisons;
                this.swaps = ctx.swaps;
                this.updateStats();
            },
            draw: () => this.draw(),
            sleep: (ms) => this.sleep(ms),
            playSound: (frequency) => this.playSound(frequency, 100)
        };
        
        switch (algorithm) {
            case 'bubble':
                await this.bubbleSort(ctx);
                break;
            case 'selection':
                await this.selectionSort(ctx);
                break;
            case 'insertion':
                await this.insertionSort(ctx);
                break;
            case 'merge':
                await this.mergeSort(0, ctx.array.length - 1, ctx);
                break;
            case 'quick':
                await this.quickSort(0, ctx.array.length - 1, ctx);
                break;
            case 'heap':
                await this.heapSort(ctx);
                break;
            default:
                throw new Error(`Unknown algorithm: ${algorithm}`);
        }
    }
    
    async bubbleSort(ctx) {
        const n = ctx.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            
            for (let j = 0; j < n - i - 1; j++) {
                // Highlight comparing elements
                ctx.array[j].state = 'comparing';
                ctx.array[j + 1].state = 'comparing';
                
                ctx.comparisons++;
                ctx.updateStats();
                ctx.draw();
                ctx.playSound(200 + ctx.array[j].value * 2);
                await ctx.sleep();
                
                if (ctx.array[j].value > ctx.array[j + 1].value) {
                    // Highlight swapping
                    ctx.array[j].state = 'swapping';
                    ctx.array[j + 1].state = 'swapping';
                    ctx.draw();
                    
                    // Swap
                    [ctx.array[j], ctx.array[j + 1]] = [ctx.array[j + 1], ctx.array[j]];
                    swapped = true;
                    ctx.swaps++;
                    ctx.updateStats();
                    ctx.playSound(400 + ctx.array[j].value * 2);
                    await ctx.sleep();
                }
                
                // Reset states
                ctx.array[j].state = 'default';
                ctx.array[j + 1].state = 'default';
            }
            
            // Mark the last element as sorted
            ctx.array[n - i - 1].state = 'sorted';
            
            if (ctx.updateProgress) {
                ctx.updateProgress(i + 1);
            }
            
            if (!swapped) break; // Early termination if already sorted
        }
        
        // Mark all as sorted
        for (let i = 0; i < n; i++) {
            ctx.array[i].state = 'sorted';
        }
        ctx.draw();
    }
    
    async selectionSort(ctx) {
        const n = ctx.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            ctx.array[i].state = 'current';
            
            for (let j = i + 1; j < n; j++) {
                ctx.array[j].state = 'comparing';
                ctx.comparisons++;
                ctx.updateStats();
                ctx.draw();
                ctx.playSound(300 + ctx.array[j].value * 2);
                await ctx.sleep();
                
                if (ctx.array[j].value < ctx.array[minIdx].value) {
                    if (minIdx !== i) ctx.array[minIdx].state = 'default';
                    minIdx = j;
                    ctx.array[minIdx].state = 'pivot';
                } else {
                    ctx.array[j].state = 'default';
                }
            }
            
            if (minIdx !== i) {
                // Highlight swapping
                ctx.array[i].state = 'swapping';
                ctx.array[minIdx].state = 'swapping';
                ctx.draw();
                await ctx.sleep();
                
                // Swap
                [ctx.array[i], ctx.array[minIdx]] = [ctx.array[minIdx], ctx.array[i]];
                ctx.swaps++;
                ctx.updateStats();
                ctx.playSound(500 + ctx.array[i].value * 2);
            }
            
            ctx.array[i].state = 'sorted';
            if (minIdx !== i) ctx.array[minIdx].state = 'default';
            
            if (ctx.updateProgress) {
                ctx.updateProgress(i + 1);
            }
            
            ctx.draw();
        }
        
        ctx.array[n - 1].state = 'sorted';
        ctx.draw();
    }
    
    async insertionSort(ctx) {
        const n = ctx.array.length;
        
        for (let i = 1; i < n; i++) {
            const key = { ...ctx.array[i] };
            let j = i - 1;
            
            ctx.array[i].state = 'current';
            ctx.draw();
            await ctx.sleep();
            
            while (j >= 0 && ctx.array[j].value > key.value) {
                ctx.array[j].state = 'comparing';
                ctx.array[j + 1].state = 'comparing';
                
                ctx.comparisons++;
                ctx.updateStats();
                ctx.draw();
                ctx.playSound(250 + ctx.array[j].value * 2);
                await ctx.sleep();
                
                // Shift element
                ctx.array[j + 1] = { ...ctx.array[j] };
                ctx.array[j + 1].state = 'swapping';
                ctx.swaps++;
                ctx.updateStats();
                ctx.draw();
                await ctx.sleep();
                
                ctx.array[j].state = 'default';
                j--;
            }
            
            ctx.array[j + 1] = key;
            ctx.array[j + 1].state = 'sorted';
            
            // Mark sorted portion
            for (let k = 0; k <= i; k++) {
                if (ctx.array[k].state !== 'sorted') {
                    ctx.array[k].state = 'sorted';
                }
            }
            
            if (ctx.updateProgress) {
                ctx.updateProgress(i);
            }
            
            ctx.draw();
        }
    }
    
    async mergeSort(left, right, ctx) {
        if (left >= right) return;
        
        const mid = Math.floor((left + right) / 2);
        
        await this.mergeSort(left, mid, ctx);
        await this.mergeSort(mid + 1, right, ctx);
        await this.merge(left, mid, right, ctx);
    }
    
    async merge(left, mid, right, ctx) {
        const leftArr = [];
        const rightArr = [];
        
        // Copy data to temp arrays
        for (let i = left; i <= mid; i++) {
            leftArr.push({ ...ctx.array[i] });
            ctx.array[i].state = 'comparing';
        }
        for (let i = mid + 1; i <= right; i++) {
            rightArr.push({ ...ctx.array[i] });
            ctx.array[i].state = 'comparing';
        }
        
        ctx.draw();
        await ctx.sleep();
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            ctx.comparisons++;
            ctx.updateStats();
            
            if (leftArr[i].value <= rightArr[j].value) {
                ctx.array[k] = { ...leftArr[i] };
                i++;
            } else {
                ctx.array[k] = { ...rightArr[j] };
                j++;
            }
            
            ctx.array[k].state = 'swapping';
            ctx.swaps++;
            ctx.updateStats();
            ctx.draw();
            ctx.playSound(300 + ctx.array[k].value * 2);
            await ctx.sleep();
            
            ctx.array[k].state = 'sorted';
            k++;
        }
        
        while (i < leftArr.length) {
            ctx.array[k] = { ...leftArr[i] };
            ctx.array[k].state = 'sorted';
            i++;
            k++;
        }
        
        while (j < rightArr.length) {
            ctx.array[k] = { ...rightArr[j] };
            ctx.array[k].state = 'sorted';
            j++;
            k++;
        }
        
        if (ctx.updateProgress) {
            const sortedCount = ctx.array.filter(bar => bar.state === 'sorted').length;
            ctx.updateProgress(sortedCount);
        }
        
        ctx.draw();
    }
    
    async quickSort(low, high, ctx) {
        if (low < high) {
            const pi = await this.partition(low, high, ctx);
            
            await this.quickSort(low, pi - 1, ctx);
            await this.quickSort(pi + 1, high, ctx);
        }
    }
    
    async partition(low, high, ctx) {
        const pivot = ctx.array[high];
        pivot.state = 'pivot';
        let i = low - 1;
        
        ctx.draw();
        await ctx.sleep();
        
        for (let j = low; j < high; j++) {
            ctx.array[j].state = 'comparing';
            ctx.comparisons++;
            ctx.updateStats();
            ctx.draw();
            ctx.playSound(350 + ctx.array[j].value * 2);
            await ctx.sleep();
            
            if (ctx.array[j].value < pivot.value) {
                i++;
                if (i !== j) {
                    ctx.array[i].state = 'swapping';
                    ctx.array[j].state = 'swapping';
                    ctx.draw();
                    await ctx.sleep();
                    
                    [ctx.array[i], ctx.array[j]] = [ctx.array[j], ctx.array[i]];
                    ctx.swaps++;
                    ctx.updateStats();
                    ctx.playSound(450 + ctx.array[i].value * 2);
                }
            }
            
            ctx.array[j].state = 'default';
        }
        
        // Place pivot in correct position
        [ctx.array[i + 1], ctx.array[high]] = [ctx.array[high], ctx.array[i + 1]];
        ctx.swaps++;
        ctx.updateStats();
        ctx.array[i + 1].state = 'sorted';
        
        // Reset states
        for (let k = low; k <= high; k++) {
            if (ctx.array[k].state !== 'sorted') {
                ctx.array[k].state = 'default';
            }
        }
        
        if (ctx.updateProgress) {
            const sortedCount = ctx.array.filter(bar => bar.state === 'sorted').length;
            ctx.updateProgress(sortedCount);
        }
        
        ctx.draw();
        return i + 1;
    }
    
    async heapSort(ctx) {
        const n = ctx.array.length;
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i, ctx);
        }
        
        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            // Move current root to end
            ctx.array[0].state = 'swapping';
            ctx.array[i].state = 'swapping';
            ctx.draw();
            await ctx.sleep();
            
            [ctx.array[0], ctx.array[i]] = [ctx.array[i], ctx.array[0]];
            ctx.swaps++;
            ctx.updateStats();
            ctx.playSound(400 + ctx.array[0].value * 2);
            
            ctx.array[i].state = 'sorted';
            ctx.array[0].state = 'default';
            
            if (ctx.updateProgress) {
                ctx.updateProgress(n - i);
            }
            
            // Call heapify on the reduced heap
            await this.heapify(i, 0, ctx);
        }
        
        ctx.array[0].state = 'sorted';
        ctx.draw();
    }
    
    async heapify(n, i, ctx) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        // Highlight current node
        ctx.array[i].state = 'current';
        ctx.draw();
        await ctx.sleep(ctx.speed / 2);
        
        if (left < n) {
            ctx.array[left].state = 'comparing';
            ctx.comparisons++;
            ctx.updateStats();
            ctx.draw();
            ctx.playSound(300 + ctx.array[left].value * 2);
            await ctx.sleep();
            
            if (ctx.array[left].value > ctx.array[largest].value) {
                largest = left;
            }
            ctx.array[left].state = 'default';
        }
        
        if (right < n) {
            ctx.array[right].state = 'comparing';
            ctx.comparisons++;
            ctx.updateStats();
            ctx.draw();
            ctx.playSound(300 + ctx.array[right].value * 2);
            await ctx.sleep();
            
            if (ctx.array[right].value > ctx.array[largest].value) {
                largest = right;
            }
            ctx.array[right].state = 'default';
        }
        
        if (largest !== i) {
            ctx.array[i].state = 'swapping';
            ctx.array[largest].state = 'swapping';
            ctx.draw();
            await ctx.sleep();
            
            [ctx.array[i], ctx.array[largest]] = [ctx.array[largest], ctx.array[i]];
            ctx.swaps++;
            ctx.updateStats();
            ctx.playSound(450 + ctx.array[i].value * 2);
            
            ctx.array[i].state = 'default';
            ctx.array[largest].state = 'default';
            
            await this.heapify(n, largest, ctx);
        } else {
            ctx.array[i].state = 'default';
        }
    }
    
    toggleCustomInput() {
        const customInput = document.getElementById('custom-input');
        const isVisible = customInput.style.display !== 'none';
        customInput.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            document.getElementById('custom-numbers').focus();
        }
    }
    
    togglePerformanceCharts() {
        const charts = document.getElementById('performance-charts');
        const isVisible = charts.style.display !== 'none';
        charts.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.initializeCharts();
        }
    }
    
    generatePatternData(pattern) {
        const size = parseInt(document.getElementById('array-size').value);
        let data = [];
        
        switch (pattern) {
            case 'random':
                for (let i = 0; i < size; i++) {
                    data.push(Math.floor(Math.random() * this.CUSTOM_DATA_MAX_HEIGHT_RACE) + this.CUSTOM_DATA_MIN_VALUE);
                }
                break;
                
            case 'sorted':
                for (let i = 0; i < size; i++) {
                    data.push(this.CUSTOM_DATA_MIN_VALUE + (i * (this.CUSTOM_DATA_MAX_HEIGHT_RACE - this.CUSTOM_DATA_MIN_VALUE) / size));
                }
                break;
                
            case 'reverse':
                for (let i = 0; i < size; i++) {
                    data.push(this.CUSTOM_DATA_MAX_HEIGHT_RACE - (i * (this.CUSTOM_DATA_MAX_HEIGHT_RACE - this.CUSTOM_DATA_MIN_VALUE) / size));
                }
                break;
                
            case 'nearly':
                for (let i = 0; i < size; i++) {
                    const baseValue = this.CUSTOM_DATA_MIN_VALUE + (i * (this.CUSTOM_DATA_MAX_HEIGHT_RACE - this.CUSTOM_DATA_MIN_VALUE) / size);
                    const noise = (Math.random() - 0.5) * 20; // Small random offset
                    data.push(Math.max(this.CUSTOM_DATA_MIN_VALUE, Math.min(this.CUSTOM_DATA_MAX_HEIGHT_RACE, baseValue + noise)));
                }
                break;
                
            case 'duplicates':
                const uniqueValues = 5;
                const values = [];
                for (let i = 0; i < uniqueValues; i++) {
                    values.push(Math.floor(Math.random() * this.CUSTOM_DATA_MAX_HEIGHT_RACE) + this.CUSTOM_DATA_MIN_VALUE);
                }
                for (let i = 0; i < size; i++) {
                    data.push(values[Math.floor(Math.random() * uniqueValues)]);
                }
                break;
                
            case 'mountain':
                const center = size / 2;
                for (let i = 0; i < size; i++) {
                    const distance = Math.abs(i - center);
                    const height = this.CUSTOM_DATA_MAX_HEIGHT_RACE - (distance / center) * (this.CUSTOM_DATA_MAX_HEIGHT_RACE - this.CUSTOM_DATA_MIN_VALUE);
                    data.push(Math.floor(height));
                }
                break;
        }
        
        document.getElementById('custom-numbers').value = data.join(', ');
        this.applyCustomData();
    }
    
    applyCustomData() {
        const input = document.getElementById('custom-numbers').value.trim();
        this.customDataErrorEl.textContent = '';
        
        if (!input) {
            this.customData = null;
            this.generateArray();
            return;
        }
        
        try {
            const numbers = input.split(',').map(str => {
                const num = parseFloat(str.trim());
                if (isNaN(num)) {
                    throw new Error(`"${str.trim()}" is not a valid number`);
                }
                return num;
            });
            
            if (numbers.length < 3) {
                throw new Error('Please provide at least 3 numbers');
            }
            
            if (numbers.length > 100) {
                throw new Error('Maximum 100 numbers allowed');
            }
            
            // Normalize values to fit visualization range
            const min = Math.min(...numbers);
            const max = Math.max(...numbers);
            const range = max - min;
            
            if (range === 0) {
                throw new Error('All numbers cannot be the same');
            }
            
            const targetMin = this.CUSTOM_DATA_MIN_VALUE;
            const targetMax = this.mode === 'race' ? this.CUSTOM_DATA_MAX_HEIGHT_RACE : this.maxHeight - 20;
            const targetRange = targetMax - targetMin;
            
            this.customData = numbers.map(num => {
                const normalized = ((num - min) / range) * targetRange + targetMin;
                return Math.round(normalized);
            });
            
            this.generateArray();
            
            // Show success message
            this.customDataErrorEl.style.color = '#4ecdc4';
            this.customDataErrorEl.textContent = `✓ Applied ${this.customData.length} custom values`;
            
        } catch (error) {
            this.customDataErrorEl.style.color = '#ff6b6b';
            this.customDataErrorEl.textContent = error.message;
        }
    }
    
    initializeCharts() {
        // Implementation for performance charts would go here
        // This is a placeholder for the chart functionality
        console.log('Performance charts initialized');
    }
    
    clearCharts() {
        // Clear chart data
        this.performanceData.clear();
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.visualizer = new AlgorithmVisualizer();
}); 