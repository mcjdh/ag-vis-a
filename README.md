# 🎨 Algorithm Visualizer

**Watch sorting algorithms come to life through elegant animations**

A beautiful, interactive web application that transforms abstract sorting algorithms into visual poetry. Built with pure HTML5 Canvas, CSS3, and JavaScript - no dependencies required!

![Algorithm Visualizer Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=Algorithm+Visualizer+Demo)

## ✨ Features

### 🎯 **Six Sorting Algorithms**
- **Bubble Sort** - Watch elements bubble to their correct positions
- **Selection Sort** - See the algorithm find and select minimum elements  
- **Insertion Sort** - Observe elements being inserted into their sorted positions
- **Merge Sort** - Experience the divide-and-conquer approach in action
- **Quick Sort** - Watch pivot-based partitioning unfold
- **Heap Sort** - Visualize heap operations and extractions

### 🎨 **Beautiful Visualizations**
- **Smooth gradient animations** with state-based color coding
- **Real-time performance metrics** (comparisons, swaps, time)
- **Responsive design** that works on all screen sizes
- **Glassmorphism UI** with modern blur effects and shadows

### ⚡ **Interactive Controls**
- **Array size adjustment** (10-200 elements)
- **Speed control** (10 different speeds from slowest to fastest)
- **Real-time algorithm switching** with educational descriptions
- **Start/Stop/Generate** controls for full user control

### 📊 **Educational Information**
- **Algorithm descriptions** explaining how each sort works
- **Time and space complexity** for each algorithm
- **Live performance metrics** showing comparisons and swaps
- **Visual state indicators** (comparing, swapping, sorted, etc.)

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software or dependencies required!

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start visualizing algorithms immediately!

```bash
git clone <repository-url>
cd algorithm-visualizer
open index.html
```

## 🎮 How to Use

1. **Select an Algorithm** - Choose from the dropdown menu
2. **Adjust Array Size** - Use the slider to set how many elements to sort
3. **Set Speed** - Control animation speed from slowest to fastest  
4. **Generate Array** - Create a new random array to sort
5. **Start Visualization** - Watch the algorithm work its magic!
6. **Stop Anytime** - Interrupt the visualization if needed

## 🎨 Color Coding

- **🔵 Blue (Default)** - Unsorted elements
- **🔴 Red (Comparing)** - Elements being compared
- **🟢 Teal (Swapping)** - Elements being swapped
- **🟣 Pink (Pivot)** - Pivot element (Quick Sort)
- **🟡 Green (Current)** - Current element being processed
- **✅ Light Green (Sorted)** - Elements in their final position

## 🛠️ Technical Details

### Architecture
- **Pure HTML5 Canvas** for smooth, hardware-accelerated rendering
- **Modern CSS3** with gradients, backdrop filters, and animations
- **ES6+ JavaScript** with async/await for smooth animation timing
- **Responsive design** using CSS Grid and Flexbox

### Performance
- **Optimized rendering** with minimal canvas redraws
- **Efficient algorithms** with proper time/space complexity
- **Smooth animations** running at 60fps
- **Memory efficient** with object pooling for array elements

### Browser Support
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 📚 Algorithm Complexities

| Algorithm      | Time (Best) | Time (Average) | Time (Worst) | Space  |
|----------------|-------------|----------------|--------------|---------|
| Bubble Sort    | O(n)        | O(n²)          | O(n²)        | O(1)    |
| Selection Sort | O(n²)       | O(n²)          | O(n²)        | O(1)    |
| Insertion Sort | O(n)        | O(n²)          | O(n²)        | O(1)    |
| Merge Sort     | O(n log n)  | O(n log n)     | O(n log n)   | O(n)    |
| Quick Sort     | O(n log n)  | O(n log n)     | O(n²)        | O(log n)|
| Heap Sort      | O(n log n)  | O(n log n)     | O(n log n)   | O(1)    |

## 🎨 Design Philosophy

This visualizer was built with the belief that **algorithms should be beautiful and accessible**. Every animation, color choice, and interaction was carefully crafted to make computer science concepts feel approachable and engaging.

### Core Principles:
- **Visual Clarity** - Each operation is clearly highlighted and timed
- **Educational Value** - Learn through seeing, not just reading
- **Aesthetic Beauty** - Algorithms can be art
- **Intuitive Interaction** - Controls feel natural and responsive

## 🤝 Contributing

This project welcomes contributions! Some ideas for enhancements:

- **Additional algorithms** (Radix Sort, Counting Sort, Bucket Sort)
- **Graph algorithms** (BFS, DFS, Dijkstra, A*)
- **Data structure visualizations** (Trees, Graphs, Hash Tables)
- **Sound integration** - Audio feedback for operations
- **Mobile optimizations** - Touch controls and gestures

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌟 Inspiration

*"The best way to understand algorithms is to see them dance."*

This visualizer was created with the hope of making computer science more accessible and beautiful. If this tool helps even one person understand sorting algorithms better, then it has fulfilled its purpose.

---

**Built with ❤️ and a passion for making algorithms beautiful** 