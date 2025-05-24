class AlgorithmVisualizer {
    constructor() {
        this.canvas = document.getElementById('visualization-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.array = [];
        this.isRunning = false;
        this.animationId = null;
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        
        // Animation settings
        this.barWidth = 0;
        this.barSpacing = 2;
        this.maxHeight = 300;
        this.speed = 100;
        
        // Colors for different states
        this.colors = {
            default: '#667eea',
            comparing: '#ff6b6b',
            swapping: '#4ecdc4',
            sorted: '#95e1d3',
            pivot: '#f38ba8',
            current: '#a8e6cf'
        };
        
        this.setupCanvas();
        this.setupEventListeners();
        this.generateArray();
        this.updateAlgorithmInfo('bubble');
    }
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 60; // Account for padding
        this.canvas.width = containerWidth;
        this.canvas.height = this.maxHeight + 60;
        this.canvas.style.background = 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)';
    }
    
    setupEventListeners() {
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
        
        // Responsive canvas
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
    }
    
    generateArray() {
        const size = parseInt(document.getElementById('array-size').value);
        this.array = [];
        
        for (let i = 0; i < size; i++) {
            this.array.push({
                value: Math.floor(Math.random() * (this.maxHeight - 20)) + 10,
                state: 'default'
            });
        }
        
        this.resetStats();
        this.calculateBarWidth();
        this.draw();
    }
    
    calculateBarWidth() {
        const totalSpacing = (this.array.length - 1) * this.barSpacing;
        this.barWidth = Math.max(2, (this.canvas.width - totalSpacing - 40) / this.array.length);
    }
    
    resetStats() {
        this.comparisons = 0;
        this.swaps = 0;
        this.updateStats();
    }
    
    updateStats() {
        document.getElementById('comparisons').textContent = this.comparisons;
        document.getElementById('swaps').textContent = this.swaps;
        
        if (this.startTime) {
            const elapsed = Date.now() - this.startTime;
            document.getElementById('time').textContent = elapsed + 'ms';
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
            
            x += this.barWidth + this.barSpacing;
        }
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
        this.resetStats();
        
        // Update button states
        document.getElementById('start-btn').disabled = true;
        document.getElementById('stop-btn').disabled = false;
        document.getElementById('generate-btn').disabled = true;
        
        const algorithm = document.getElementById('algorithm-select').value;
        
        try {
            switch (algorithm) {
                case 'bubble':
                    await this.bubbleSort();
                    break;
                case 'selection':
                    await this.selectionSort();
                    break;
                case 'insertion':
                    await this.insertionSort();
                    break;
                case 'merge':
                    await this.mergeSort(0, this.array.length - 1);
                    break;
                case 'quick':
                    await this.quickSort(0, this.array.length - 1);
                    break;
                case 'heap':
                    await this.heapSort();
                    break;
            }
            
            // Mark all as sorted
            for (let bar of this.array) {
                bar.state = 'sorted';
            }
            this.draw();
            
        } catch (error) {
            console.log('Visualization stopped');
        }
        
        this.stopVisualization();
    }
    
    stopVisualization() {
        this.isRunning = false;
        
        // Reset button states
        document.getElementById('start-btn').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        document.getElementById('generate-btn').disabled = false;
        
        // Reset all bar states
        for (let bar of this.array) {
            bar.state = 'default';
        }
        this.draw();
    }
    
    async sleep(ms = null) {
        if (!this.isRunning) throw new Error('Stopped');
        const delay = ms || this.speed * 10;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    
    async bubbleSort() {
        const n = this.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                // Highlight comparison
                this.array[j].state = 'comparing';
                this.array[j + 1].state = 'comparing';
                this.comparisons++;
                this.updateStats();
                this.draw();
                await this.sleep();
                
                if (this.array[j].value > this.array[j + 1].value) {
                    // Highlight swap
                    this.array[j].state = 'swapping';
                    this.array[j + 1].state = 'swapping';
                    this.draw();
                    await this.sleep(50);
                    
                    // Perform swap
                    [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
                    this.swaps++;
                    this.updateStats();
                }
                
                // Reset states
                this.array[j].state = 'default';
                this.array[j + 1].state = 'default';
            }
            // Mark last element as sorted
            this.array[n - 1 - i].state = 'sorted';
        }
        this.array[0].state = 'sorted';
    }
    
    async selectionSort() {
        const n = this.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            this.array[i].state = 'current';
            
            for (let j = i + 1; j < n; j++) {
                this.array[j].state = 'comparing';
                this.comparisons++;
                this.updateStats();
                this.draw();
                await this.sleep();
                
                if (this.array[j].value < this.array[minIdx].value) {
                    if (minIdx !== i) this.array[minIdx].state = 'default';
                    minIdx = j;
                    this.array[minIdx].state = 'pivot';
                } else {
                    this.array[j].state = 'default';
                }
            }
            
            if (minIdx !== i) {
                // Highlight swap
                this.array[i].state = 'swapping';
                this.array[minIdx].state = 'swapping';
                this.draw();
                await this.sleep(100);
                
                [this.array[i], this.array[minIdx]] = [this.array[minIdx], this.array[i]];
                this.swaps++;
                this.updateStats();
            }
            
            this.array[i].state = 'sorted';
            if (minIdx !== i) this.array[minIdx].state = 'default';
        }
        this.array[n - 1].state = 'sorted';
    }
    
    async insertionSort() {
        for (let i = 1; i < this.array.length; i++) {
            let key = this.array[i];
            let j = i - 1;
            
            key.state = 'current';
            this.draw();
            await this.sleep();
            
            while (j >= 0 && this.array[j].value > key.value) {
                this.array[j].state = 'comparing';
                this.comparisons++;
                this.updateStats();
                this.draw();
                await this.sleep();
                
                this.array[j + 1] = this.array[j];
                this.array[j + 1].state = 'swapping';
                this.swaps++;
                this.updateStats();
                this.draw();
                await this.sleep(50);
                
                this.array[j + 1].state = 'default';
                j--;
            }
            
            this.array[j + 1] = key;
            this.array[j + 1].state = 'sorted';
            
            // Mark sorted portion
            for (let k = 0; k <= i; k++) {
                if (this.array[k].state !== 'sorted') {
                    this.array[k].state = 'sorted';
                }
            }
        }
    }
    
    async mergeSort(left, right) {
        if (left >= right) return;
        
        const mid = Math.floor((left + right) / 2);
        
        await this.mergeSort(left, mid);
        await this.mergeSort(mid + 1, right);
        await this.merge(left, mid, right);
    }
    
    async merge(left, mid, right) {
        const leftArr = [];
        const rightArr = [];
        
        // Copy data to temp arrays
        for (let i = left; i <= mid; i++) {
            leftArr.push({...this.array[i]});
        }
        for (let i = mid + 1; i <= right; i++) {
            rightArr.push({...this.array[i]});
        }
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            this.comparisons++;
            this.updateStats();
            
            if (leftArr[i].value <= rightArr[j].value) {
                this.array[k] = leftArr[i];
                i++;
            } else {
                this.array[k] = rightArr[j];
                j++;
            }
            
            this.array[k].state = 'swapping';
            this.swaps++;
            this.updateStats();
            this.draw();
            await this.sleep();
            this.array[k].state = 'sorted';
            k++;
        }
        
        while (i < leftArr.length) {
            this.array[k] = leftArr[i];
            this.array[k].state = 'sorted';
            i++;
            k++;
        }
        
        while (j < rightArr.length) {
            this.array[k] = rightArr[j];
            this.array[k].state = 'sorted';
            j++;
            k++;
        }
        
        this.draw();
        await this.sleep();
    }
    
    async quickSort(low, high) {
        if (low < high) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }
    
    async partition(low, high) {
        const pivot = this.array[high];
        pivot.state = 'pivot';
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            this.array[j].state = 'comparing';
            this.comparisons++;
            this.updateStats();
            this.draw();
            await this.sleep();
            
            if (this.array[j].value < pivot.value) {
                i++;
                if (i !== j) {
                    this.array[i].state = 'swapping';
                    this.array[j].state = 'swapping';
                    this.draw();
                    await this.sleep(50);
                    
                    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
                    this.swaps++;
                    this.updateStats();
                }
            }
            
            this.array[j].state = 'default';
            if (i !== j) this.array[i].state = 'default';
        }
        
        this.array[i + 1].state = 'swapping';
        this.array[high].state = 'swapping';
        this.draw();
        await this.sleep(100);
        
        [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
        this.swaps++;
        this.updateStats();
        
        this.array[i + 1].state = 'sorted';
        this.array[high].state = 'default';
        
        return i + 1;
    }
    
    async heapSort() {
        const n = this.array.length;
        
        // Build heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i);
        }
        
        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            // Move current root to end
            this.array[0].state = 'swapping';
            this.array[i].state = 'swapping';
            this.draw();
            await this.sleep(100);
            
            [this.array[0], this.array[i]] = [this.array[i], this.array[0]];
            this.swaps++;
            this.updateStats();
            
            this.array[i].state = 'sorted';
            this.array[0].state = 'default';
            
            // Call heapify on the reduced heap
            await this.heapify(i, 0);
        }
        this.array[0].state = 'sorted';
    }
    
    async heapify(n, i) {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        
        if (left < n) {
            this.array[left].state = 'comparing';
            this.comparisons++;
            this.updateStats();
            this.draw();
            await this.sleep();
            
            if (this.array[left].value > this.array[largest].value) {
                largest = left;
            }
            this.array[left].state = 'default';
        }
        
        if (right < n) {
            this.array[right].state = 'comparing';
            this.comparisons++;
            this.updateStats();
            this.draw();
            await this.sleep();
            
            if (this.array[right].value > this.array[largest].value) {
                largest = right;
            }
            this.array[right].state = 'default';
        }
        
        if (largest !== i) {
            this.array[i].state = 'swapping';
            this.array[largest].state = 'swapping';
            this.draw();
            await this.sleep(100);
            
            [this.array[i], this.array[largest]] = [this.array[largest], this.array[i]];
            this.swaps++;
            this.updateStats();
            
            this.array[i].state = 'default';
            this.array[largest].state = 'default';
            
            await this.heapify(n, largest);
        }
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AlgorithmVisualizer();
}); 