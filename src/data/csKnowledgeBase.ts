// ============================================================================
// DevPilot — Computer Science Knowledge Base (Grounded in W3Schools & GeeksforGeeks)
// ============================================================================
import type { LucideIcon } from 'lucide-react';
import {
  Code2, Binary, Database, Cpu, Network,
  Sparkles, Brain, ShieldAlert, Globe
} from 'lucide-react';

export interface CSSubject {
  id: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
  description: string;
  color: string;
  accentBg: string;
  borderHover: string;
  recommendedQuestions: string[];
}

export const CS_SUBJECTS: CSSubject[] = [
  {
    id: 'programming',
    name: 'Programming Fundamentals',
    shortName: 'Programming',
    icon: Code2,
    description: 'Core concepts in Python, C++, Java, and JS: syntax, pointers, memory, OOP, and functional paradigms.',
    color: 'text-blue-500',
    accentBg: 'from-blue-500/10 to-indigo-500/10',
    borderHover: 'hover:border-blue-500/50',
    recommendedQuestions: [
      'Explain pointers and dynamic memory allocation in C/C++ with code',
      'What are the 4 Pillars of OOP (Encapsulation, Inheritance, Polymorphism, Abstraction)?',
      'How do Python list comprehensions, generators, and decorators work?',
      'Explain asynchronous execution, event loop, and Promises in JavaScript',
    ],
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    shortName: 'DSA',
    icon: Binary,
    description: 'Arrays, Linked Lists, Trees, Graphs, Sorting, Dynamic Programming, and Big-O asymptotic analysis.',
    color: 'text-violet-500',
    accentBg: 'from-violet-500/10 to-purple-500/10',
    borderHover: 'hover:border-violet-500/50',
    recommendedQuestions: [
      'Explain Big-O notation, time complexity, and space complexity with examples',
      'How does QuickSort work and what is its average vs worst-case complexity?',
      'Difference between BFS and DFS traversal on a Graph with code',
      'Explain Dynamic Programming: Memoization vs Tabulation with Fibonacci',
    ],
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    shortName: 'DBMS',
    icon: Database,
    description: 'Relational database design, SQL queries, joins, ACID properties, indexing, and normalization.',
    color: 'text-emerald-500',
    accentBg: 'from-emerald-500/10 to-teal-500/10',
    borderHover: 'hover:border-emerald-500/50',
    recommendedQuestions: [
      'Explain ACID properties in DBMS with real-world banking transactions',
      'What is Database Normalization (1NF, 2NF, 3NF, BCNF) and why is it needed?',
      'Explain SQL JOINs (INNER, LEFT, RIGHT, FULL) with clear syntax and examples',
      'How do B-Tree and Hash Indexes speed up database queries in PostgreSQL/MySQL?',
    ],
  },
  {
    id: 'os',
    name: 'Operating Systems',
    shortName: 'Operating Systems',
    icon: Cpu,
    description: 'Processes, threads, CPU scheduling algorithms, memory paging, deadlocks, and synchronization.',
    color: 'text-amber-500',
    accentBg: 'from-amber-500/10 to-orange-500/10',
    borderHover: 'hover:border-amber-500/50',
    recommendedQuestions: [
      'What is the difference between a Process and a Thread in modern OS?',
      'Explain Deadlock: the 4 Coffman conditions and how Banker’s algorithm prevents it',
      'How does Virtual Memory, Paging, and Page Fault handling work in OS?',
      'Compare CPU scheduling algorithms: FCFS, Round Robin, and Shortest Job First (SJF)',
    ],
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    shortName: 'Networks',
    icon: Network,
    description: 'OSI 7-layer architecture, TCP/IP, subnetting, routing protocols, DNS, and HTTP/HTTPS handshakes.',
    color: 'text-cyan-500',
    accentBg: 'from-cyan-500/10 to-blue-500/10',
    borderHover: 'hover:border-cyan-500/50',
    recommendedQuestions: [
      'Explain all 7 layers of the OSI Model and their key protocols',
      'TCP vs UDP detailed comparison (reliability, overhead, three-way handshake)',
      'What happens step-by-step when you type https://google.com into your browser?',
      'How does IP Addressing, Subnetting (CIDR), and DNS resolution work?',
    ],
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    shortName: 'AI',
    icon: Sparkles,
    description: 'Heuristic search algorithms, A* search, game trees, expert systems, and knowledge representation.',
    color: 'text-rose-500',
    accentBg: 'from-rose-500/10 to-pink-500/10',
    borderHover: 'hover:border-rose-500/50',
    recommendedQuestions: [
      'How does the A* Search Algorithm work with admissible heuristics?',
      'Explain Minimax algorithm and Alpha-Beta pruning in game playing AI',
      'What is the PEAS framework for intelligent agents in AI?',
      'Explain Natural Language Processing fundamentals: tokenization, stemming & embeddings',
    ],
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    shortName: 'Machine Learning',
    icon: Brain,
    description: 'Supervised & unsupervised learning, gradient descent, neural networks, loss functions, and evaluation.',
    color: 'text-indigo-500',
    accentBg: 'from-indigo-500/10 to-violet-500/10',
    borderHover: 'hover:border-indigo-500/50',
    recommendedQuestions: [
      'Difference between Supervised, Unsupervised, and Reinforcement Learning with examples',
      'Explain Overfitting vs Underfitting and how Regularization (L1/L2) solves it',
      'How does Gradient Descent and Backpropagation optimize Neural Network weights?',
      'What are Precision, Recall, F1-Score, and ROC-AUC curves in ML evaluation?',
    ],
  },
  {
    id: 'security',
    name: 'Cyber Security',
    shortName: 'Cyber Security',
    icon: ShieldAlert,
    description: 'Cryptography (RSA, AES), web vulnerabilities (SQLi, XSS, CSRF), SSL/TLS, and authentication.',
    color: 'text-red-500',
    accentBg: 'from-red-500/10 to-rose-500/10',
    borderHover: 'hover:border-red-500/50',
    recommendedQuestions: [
      'Explain Symmetric vs Asymmetric Encryption (AES vs RSA with public/private keys)',
      'What is SQL Injection (SQLi) and Cross-Site Scripting (XSS)? How do you prevent them?',
      'How does the SSL/TLS Handshake establish a secure encrypted HTTPS connection?',
      'Difference between Hashing, Encryption, and Encoding with password salting best practices',
    ],
  },
  {
    id: 'webdev',
    name: 'Web Development',
    shortName: 'Web Dev',
    icon: Globe,
    description: 'Modern full-stack web engineering: HTML5, CSS Flexbox/Grid, React hooks, REST APIs, and JWT.',
    color: 'text-sky-500',
    accentBg: 'from-sky-500/10 to-teal-500/10',
    borderHover: 'hover:border-sky-500/50',
    recommendedQuestions: [
      'CSS Flexbox vs CSS Grid: when to use each with practical responsive code',
      'How does React Virtual DOM and reconciliation work with the useEffect hook lifecycle?',
      'Explain RESTful API design principles, HTTP methods, and status codes (200, 201, 400, 404, 500)',
      'How does JWT (JSON Web Token) authentication and session persistence work?',
    ],
  },
];

export interface KnowledgeEntry {
  keywords: string[];
  title: string;
  subject: string;
  content: string;
}

export const CS_KNOWLEDGE_ENTRIES: KnowledgeEntry[] = [
  // ── 1. PROGRAMMING ──
  {
    keywords: ['pointer', 'pointers', 'memory allocation', 'malloc', 'calloc', 'free', 'c++', 'c language'],
    title: 'Pointers and Dynamic Memory Allocation in C/C++',
    subject: 'Programming Fundamentals (GeeksforGeeks / W3Schools)',
    content: `### Pointers and Dynamic Memory Allocation in C/C++

A **pointer** is a variable that stores the memory address of another variable.

#### 1. Pointer Basics
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int x = 42;
    int* ptr = &x; // ptr stores the address of x

    cout << "Value of x: " << x << endl;          // 42
    cout << "Address of x (&x): " << ptr << endl;  // e.g. 0x7ffee4b
    cout << "Dereferencing (*ptr): " << *ptr << endl; // 42

    *ptr = 100; // Modifies the value of x directly
    cout << "New value of x: " << x << endl;      // 100
    return 0;
}
\`\`\`

#### 2. Dynamic Memory Allocation
- **Stack Memory:** Automatically allocated and freed when a function returns.
- **Heap Memory:** Manually allocated at runtime using \`malloc\`/\`calloc\` (in C) or \`new\` (in C++), and must be freed using \`free\` or \`delete\` to avoid **memory leaks**.

\`\`\`cpp
// In C++:
int* arr = new int[5]; // Allocate array of 5 integers on heap
for (int i = 0; i < 5; i++) arr[i] = i * 10;

delete[] arr; // Free heap memory
arr = nullptr; // Avoid dangling pointer
\`\`\`

> **W3Schools / GfG Tip:** Always set pointers to \`nullptr\` (or \`NULL\`) after deallocating to prevent accidental **dangling pointer** access!`,
  },
  {
    keywords: ['oop', 'object oriented', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'class', 'object'],
    title: 'The 4 Pillars of Object-Oriented Programming (OOP)',
    subject: 'Programming Fundamentals (W3Schools & GeeksforGeeks)',
    content: `### The 4 Pillars of Object-Oriented Programming (OOP)

OOP organizes software design around **objects** (data) and **methods** (actions) rather than pure procedural logic.

| Pillar | Definition | Practical Purpose | Real-World Example |
| :--- | :--- | :--- | :--- |
| **Encapsulation** | Bundling data & methods into a class, hiding internal state via private attributes and public getters/setters. | Data protection & controlled access | A BankAccount where balance cannot be changed directly without \`deposit()\` / \`withdraw()\`. |
| **Abstraction** | Hiding complex implementation details and showing only the essential interface to the user. | Simplifies usage & reduces complexity | Starting a car with a key/button without needing to know engine piston combustion. |
| **Inheritance** | A mechanism where a child class inherits fields and methods from a parent class. | Code reusability & hierarchical classification | \`Dog\` and \`Cat\` inherit \`eat()\` and \`sleep()\` from parent class \`Animal\`. |
| **Polymorphism** | "Many forms" — ability of a message or method to be processed in more than one way (Compile-time vs Run-time). | Flexibility & extensibility | \`draw()\` method behaves differently for \`Circle\`, \`Square\`, and \`Triangle\`. |

\`\`\`python
# Python OOP Demonstration
class Animal:
    def __init__(self, name):
        self._name = name # Encapsulation (protected attribute)

    def speak(self): # Abstraction / Base interface
        raise NotImplementedError("Subclasses must implement speak()")

class Dog(Animal): # Inheritance
    def speak(self): # Polymorphism (method overriding)
        return f"{self._name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self._name} says Meow!"

animals = [Dog("Buddy"), Cat("Luna")]
for a in animals:
    print(a.speak()) # Output: Buddy says Woof! / Luna says Meow!
\`\`\``,
  },
  {
    keywords: ['recursion', 'recursive', 'base case', 'call stack', 'recursive case', 'fibonacci'],
    title: 'Understanding Recursion Line-by-Line',
    subject: 'Programming & DSA (W3Schools & GeeksforGeeks)',
    content: `### Understanding Recursion (Step-by-Step)

A function is **recursive** if it calls itself to solve a smaller subproblem of the original problem.

#### The Two Rules of Every Recursive Function:
1. **Base Case:** A stopping condition that returns a value directly without making further recursive calls. Without this, you get a \`StackOverflowError\`.
2. **Recursive Step:** The call to itself with modified arguments that move closer to the base case.

\`\`\`python
def factorial(n: int) -> int:
    # 1. Base case: 0! = 1 and 1! = 1
    if n <= 1:
        return 1
    
    # 2. Recursive step: n * factorial(n - 1)
    return n * factorial(n - 1)

print(factorial(4)) # Output: 24
\`\`\`

#### How the Call Stack Executes \`factorial(4)\`:
\`\`\`
[Call Phase]
factorial(4) -> 4 * factorial(3)
factorial(3) -> 3 * factorial(2)
factorial(2) -> 2 * factorial(1)
factorial(1) -> returns 1 (Base Case hit!)

[Unwinding Phase]
factorial(2) returns 2 * 1 = 2
factorial(3) returns 3 * 2 = 6
factorial(4) returns 4 * 6 = 24
\`\`\`

- **Time Complexity:** $O(N)$
- **Space Complexity:** $O(N)$ auxiliary stack space.`,
  },
  {
    keywords: ['comprehension', 'decorator', 'generator', 'python list comprehension', 'yield'],
    title: 'Python Comprehensions, Generators, and Decorators',
    subject: 'Programming Fundamentals (W3Schools Python)',
    content: `### Python Comprehensions, Generators, and Decorators

#### 1. List Comprehensions
A concise way to construct lists without multi-line \`for\` loops.
\`\`\`python
# Squares of even numbers from 0 to 9
evens_squared = [x**2 for x in range(10) if x % 2 == 0]
# Output: [0, 4, 16, 36, 64]
\`\`\`

#### 2. Generators & the \`yield\` Keyword
Generators produce items on-demand (**lazy evaluation**), storing only the current state in memory instead of the whole list.
\`\`\`python
def count_up_to(max_val):
    count = 1
    while count <= max_val:
        yield count  # Pauses execution and returns value
        count += 1

gen = count_up_to(3)
print(next(gen)) # 1
print(next(gen)) # 2
print(next(gen)) # 3
\`\`\`
- *Memory efficiency:* Generating 10,000,000 items with a generator uses a few bytes, whereas a list uses hundreds of megabytes!

#### 3. Decorators
A decorator is a function that takes another function as an argument, extends its behavior, and returns a new function without modifying the original source code.
\`\`\`python
def log_execution(func):
    def wrapper(*args, **kwargs):
        print(f"Executing: {func.__name__}...")
        result = func(*args, **kwargs)
        print("Execution complete.")
        return result
    return wrapper

@log_execution
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")
\`\`\``,
  },

  // ── 2. DATA STRUCTURES & ALGORITHMS (DSA) ──
  {
    keywords: ['big o', 'complexity', 'time complexity', 'space complexity', 'asymptotic', 'omega', 'theta'],
    title: 'Big-O Notation and Complexity Analysis',
    subject: 'Data Structures & Algorithms (GeeksforGeeks)',
    content: `### Big-O Notation and Complexity Analysis

**Big-O Notation** describes the upper bound of an algorithm's execution time or memory space as the input size ($N$) grows toward infinity.

#### Common Complexities (Fastest to Slowest):
1. **$O(1)$ — Constant Time:** Array index lookup (\`arr[0]\`), Hash Map lookup/insert, push/pop on stack.
2. **$O(\\log N)$ — Logarithmic Time:** Binary Search on a sorted array, search in a balanced Binary Search Tree (BST).
3. **$O(N)$ — Linear Time:** Linear search through an array, single for-loop iterating $N$ elements.
4. **$O(N \\log N)$ — Linearithmic Time:** Optimal comparison sorting algorithms: **Merge Sort**, **QuickSort (average)**, **Heap Sort**.
5. **$O(N^2)$ — Quadratic Time:** Nested loops: Bubble Sort, Selection Sort, Insertion Sort, brute force pair search.
6. **$O(2^N)$ — Exponential Time:** Recursive calculation of Fibonacci without memoization, generating all subsets of a set.
7. **$O(N!)$ — Factorial Time:** Generating all permutations, solving the Traveling Salesperson Problem via brute force.

#### Rules for Simplifying Big-O:
- **Drop Constants:** $O(2N + 5) \\rightarrow O(N)$
- **Drop Non-Dominant Terms:** $O(N^2 + 100N) \\rightarrow O(N^2)$`,
  },
  {
    keywords: ['quicksort', 'merge sort', 'sorting', 'divide and conquer', 'partition'],
    title: 'QuickSort and MergeSort: Divide-and-Conquer Analysis',
    subject: 'Data Structures & Algorithms (GeeksforGeeks)',
    content: `### QuickSort: Divide and Conquer Sorting

QuickSort picks an element as a **pivot** and partitions the given array around the picked pivot so that elements smaller than the pivot go to the left and larger elements go to the right.

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([10, 7, 8, 9, 1, 5]))
# Output: [1, 5, 7, 8, 9, 10]
\`\`\`

#### Complexity Comparison Table:
| Algorithm | Best Time | Average Time | Worst Time | Space Complexity | Stable? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **QuickSort** | $O(N \\log N)$ | $O(N \\log N)$ | $O(N^2)$ (sorted input with bad pivot) | $O(\\log N)$ | No |
| **MergeSort** | $O(N \\log N)$ | $O(N \\log N)$ | $O(N \\log N)$ (guaranteed) | $O(N)$ auxiliary | Yes |

> **Interview Tip (GfG):** QuickSort is often preferred in practice for internal memory arrays because of high cache locality and in-place partitioning!`,
  },
  {
    keywords: ['bfs', 'dfs', 'graph', 'tree traversal', 'breadth first', 'depth first'],
    title: 'Graph Traversals: BFS vs DFS with Implementations',
    subject: 'Data Structures & Algorithms (GeeksforGeeks)',
    content: `### Graph Traversals: BFS vs DFS

Both algorithms visit every vertex in a graph of $V$ vertices and $E$ edges in $O(V + E)$ time.

#### 1. Breadth-First Search (BFS)
- Uses a **Queue (FIFO)**.
- Explores neighbor nodes level-by-level before moving deeper.
- **Primary Use Case:** Finding the **shortest path in an unweighted graph** and finding nearest peers.

\`\`\`python
from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    traversal = []

    while queue:
        vertex = queue.popleft()
        traversal.append(vertex)
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return traversal
\`\`\`

#### 2. Depth-First Search (DFS)
- Uses a **Stack (LIFO)** or **System Call Stack (Recursion)**.
- Explores as deep as possible along each branch before backtracking.
- **Primary Use Case:** Topological Sort, Cycle Detection in Graphs, Maze Solving, Finding Connected Components.`,
  },
  {
    keywords: ['dynamic programming', 'dp', 'memoization', 'tabulation', 'optimal substructure', 'overlapping subproblems'],
    title: 'Dynamic Programming: Memoization vs Tabulation',
    subject: 'Data Structures & Algorithms (GeeksforGeeks)',
    content: `### Dynamic Programming (DP) Fundamentals

Dynamic Programming solves complex problems by breaking them down into smaller overlapping subproblems, solving each subproblem once, and storing the solution.

#### Two Key Conditions for DP:
1. **Optimal Substructure:** The optimal solution to the problem can be constructed from optimal solutions to its subproblems.
2. **Overlapping Subproblems:** The same subproblems are solved multiple times if computed recursively.

#### Memoization (Top-Down) vs Tabulation (Bottom-Up):
\`\`\`python
# 1. Top-Down (Memoization with Cache)
def fib_memo(n, memo={}):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

# 2. Bottom-Up (Tabulation with Iteration)
def fib_tab(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
\`\`\`
- **Naive Recursion:** $O(2^N)$ time.
- **Dynamic Programming:** $O(N)$ time and $O(N)$ space (or $O(1)$ space with two variables).`,
  },

  // ── 3. DBMS (DATABASE MANAGEMENT SYSTEMS) ──
  {
    keywords: ['acid', 'atomicity', 'consistency', 'isolation', 'durability', 'transaction'],
    title: 'ACID Properties in Database Management Systems',
    subject: 'DBMS (GeeksforGeeks & W3Schools)',
    content: `### ACID Properties in Relational Databases

A **transaction** is a logical unit of database processing that includes one or more database operations (Read, Insert, Update, Delete). Relational databases guarantee the **ACID** properties:

- **A — Atomicity ("All or Nothing"):** Either every single statement of a transaction succeeds, or the entire transaction is rolled back. If money is deducted from Account A, it must reach Account B; if the server crashes in between, Account A's deduction is cancelled.
- **C — Consistency:** A transaction must take the database from one valid state to another, preserving all constraints, cascades, unique keys, and triggers.
- **I — Isolation:** Concurrent transactions do not interfere with each other. Intermediate states of one transaction are invisible to other transactions until committed.
  - *Isolation levels:* Read Uncommitted, Read Committed, Repeatable Read, Serializable.
- **D — Durability:** Once a transaction commits, its changes are permanently written to non-volatile storage (via write-ahead logging) even if the system immediately experiences a power failure or crash.`,
  },
  {
    keywords: ['normalization', '1nf', '2nf', '3nf', 'bcnf', 'normal forms', 'redundancy', 'anomaly'],
    title: 'Database Normalization: 1NF, 2NF, 3NF, and BCNF',
    subject: 'DBMS (GeeksforGeeks & W3Schools)',
    content: `### Database Normalization (1NF, 2NF, 3NF, BCNF)

**Normalization** is the systematic process of structuring a relational database to minimize **data redundancy** and avoid **insertion, update, and deletion anomalies**.

| Normal Form | Condition Required | What it Eliminates |
| :--- | :--- | :--- |
| **1NF (First)** | Each column must contain atomic (indivisible) values. No repeating groups or arrays in a column. | Multi-valued attributes |
| **2NF (Second)** | Must be in 1NF **AND** all non-key attributes must be fully functionally dependent on the entire primary key. | **Partial Dependencies** (where an attribute depends on only part of a composite primary key) |
| **3NF (Third)** | Must be in 2NF **AND** no non-prime attribute depends on another non-prime attribute ($X \\rightarrow Y$). | **Transitive Dependencies** (e.g. \`EmpID -> DeptID -> DeptName\`) |
| **BCNF (Boyce-Codd)** | A stricter version of 3NF: For every functional dependency $X \\rightarrow Y$, $X$ must be a super key. | Any remaining functional anomalies |

> **GfG Rule of Thumb:** For almost all enterprise software and web applications, normalizing up to **3NF** provides the best balance of data integrity and query performance!`,
  },
  {
    keywords: ['join', 'inner join', 'left join', 'right join', 'full join', 'sql joins'],
    title: 'SQL JOINs: INNER, LEFT, RIGHT, and FULL Explained',
    subject: 'DBMS (W3Schools SQL Tutorial)',
    content: `### SQL JOINs Visualized

JOIN clauses combine rows from two or more tables based on a related column between them.

\`\`\`sql
-- Sample Tables: Students(id, name, dept_id) & Departments(id, dept_name)

-- 1. INNER JOIN: Returns records that have matching values in both tables
SELECT s.name, d.dept_name
FROM Students s
INNER JOIN Departments d ON s.dept_id = d.id;

-- 2. LEFT (OUTER) JOIN: Returns all records from left table, and matched records from right table
SELECT s.name, d.dept_name
FROM Students s
LEFT JOIN Departments d ON s.dept_id = d.id;

-- 3. RIGHT (OUTER) JOIN: Returns all records from right table, and matched records from left table
SELECT s.name, d.dept_name
FROM Students s
RIGHT JOIN Departments d ON s.dept_id = d.id;

-- 4. FULL (OUTER) JOIN: Returns all records when there is a match in either left or right table
SELECT s.name, d.dept_name
FROM Students s
FULL OUTER JOIN Departments d ON s.dept_id = d.id;
\`\`\``,
  },

  // ── 4. OPERATING SYSTEMS (OS) ──
  {
    keywords: ['process vs thread', 'process', 'thread', 'multithreading', 'context switch', 'pcb'],
    title: 'Process vs Thread: Core Differences',
    subject: 'Operating Systems (GeeksforGeeks)',
    content: `### Process vs Thread: Core Architectural Differences

| Parameter | Process | Thread (Lightweight Process) |
| :--- | :--- | :--- |
| **Definition** | An independent executing program with its own dedicated memory space. | The smallest unit of execution within a parent process. |
| **Memory & Address Space** | Has its own independent address space (code, data, heap, stack). | Shares code, data, and heap with peer threads; has its own private stack and registers. |
| **Creation & Context Switch** | Heavyweight. Creating a process and context switching is slow (swaps page tables). | Lightweight. Fast creation and low-overhead context switching. |
| **Communication** | Requires **Inter-Process Communication (IPC)**: Sockets, Pipes, Shared Memory, Message Queues. | Direct communication via shared memory variables (requires synchronization locks). |
| **Failure Impact** | If one process crashes, other processes remain unaffected (isolated). | If one thread causes a segmentation fault, the entire parent process crashes. |`,
  },
  {
    keywords: ['deadlock', 'banker', 'coffman', 'mutual exclusion', 'circular wait', 'hold and wait'],
    title: 'Deadlock: The 4 Coffman Conditions & Banker’s Algorithm',
    subject: 'Operating Systems (GeeksforGeeks)',
    content: `### Deadlock in Operating Systems

A **deadlock** is a state where two or more processes are blocked because each process is holding a resource and waiting for another resource held by another process.

#### The 4 Coffman Conditions (All 4 must hold simultaneously for deadlock):
1. **Mutual Exclusion:** At least one resource must be non-shareable (only one process at a time can use it).
2. **Hold and Wait:** A process is holding at least one resource and is waiting to acquire additional resources held by other processes.
3. **No Preemption:** Resources cannot be forcibly confiscated from a process; they can only be released voluntarily.
4. **Circular Wait:** A closed loop chain of processes exists: $P_0$ waits for resource held by $P_1$, $P_1$ waits for $P_2$, ..., and $P_n$ waits for $P_0$.

#### Methods for Handling Deadlocks:
- **Deadlock Prevention:** Design the system to ensure at least one of the 4 Coffman conditions can never hold (e.g. impose a linear global ordering on resource requests).
- **Deadlock Avoidance (Banker's Algorithm):** Dynamically check resource allocation requests. If granting a resource leaves the system in a **Safe State**, allocate it; otherwise, make the process wait.
- **Deadlock Detection and Recovery:** Let deadlocks occur, detect them with a Resource Allocation Graph (cycle detection), and kill processes or preempt resources to break the cycle.`,
  },
  {
    keywords: ['virtual memory', 'paging', 'page fault', 'tlb', 'segmentation', 'page replacement', 'lru'],
    title: 'Virtual Memory and Paging in Operating Systems',
    subject: 'Operating Systems (GeeksforGeeks)',
    content: `### Virtual Memory and Paging

**Virtual Memory** gives an application the illusion of having a vast, contiguous block of RAM, even if physical RAM is limited and fragmented.

#### How Paging Works:
1. Virtual address space is divided into fixed-size chunks called **Pages** (typically 4 KB).
2. Physical RAM is divided into fixed-size chunks of the same size called **Frames**.
3. The **Memory Management Unit (MMU)** translates Virtual Addresses into Physical Addresses using a **Page Table**.
4. **Translation Lookaside Buffer (TLB):** A high-speed hardware cache of recent virtual-to-physical address mappings.

#### What is a Page Fault?
When a CPU tries to access a page marked invalid (not currently loaded into physical RAM), the MMU raises a hardware interrupt called a **Page Fault**.
1. OS catches the interrupt and halts the process.
2. OS finds a free physical frame in RAM (or evicts an existing page using **LRU / FIFO page replacement**).
3. Reads the required page from secondary storage (swap space/disk) into the physical frame.
4. Updates the Page Table and restarts the interrupted instruction.`,
  },

  // ── 5. COMPUTER NETWORKS ──
  {
    keywords: ['osi model', 'osi layers', '7 layers', 'application presentation session transport network data link physical'],
    title: 'The 7 Layers of the OSI Model',
    subject: 'Computer Networks (GeeksforGeeks)',
    content: `### The 7 Layers of the OSI Model

The Open Systems Interconnection (OSI) model standardizes communication functions in telecommunications and computer systems.

| Layer | Name | Key Function | Standard Protocols & Devices |
| :--- | :--- | :--- | :--- |
| **7** | **Application** | Network services directly accessible by user software. | HTTP, HTTPS, FTP, DNS, SMTP, SSH |
| **6** | **Presentation** | Data formatting, character code translation, compression, and encryption. | SSL/TLS, JSON, JPEG, ASCII |
| **5** | **Session** | Manages, establishes, maintains, and terminates communication sessions. | RPC, NetBIOS, PPTP |
| **4** | **Transport** | End-to-end delivery, flow control, error checking, and segmentation. | **TCP** (reliable), **UDP** (connectionless) |
| **3** | **Network** | Logical addressing (IP) and routing packets across multiple networks. | IPv4, IPv6, ICMP, Routers |
| **2** | **Data Link** | Physical addressing (MAC), framing, node-to-node hop delivery, error detection. | Ethernet, Wi-Fi (802.11), Switches |
| **1** | **Physical** | Transmitting raw unstructured bitstreams over physical transmission medium. | Cables, Fiber optics, Hubs, Radio frequencies |

> **Mnemonic to remember from Layer 7 to 1:** **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing!`,
  },
  {
    keywords: ['tcp vs udp', 'tcp', 'udp', 'three way handshake', 'syn ack', 'reliable'],
    title: 'TCP vs UDP and the Three-Way Handshake',
    subject: 'Computer Networks (GeeksforGeeks)',
    content: `### TCP vs UDP & The TCP Three-Way Handshake

#### 1. TCP vs UDP Comparison:
| Feature | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
| :--- | :--- | :--- |
| **Connection** | Connection-oriented (handshake required) | Connectionless (no pre-established connection) |
| **Reliability** | Guaranteed delivery (retransmits lost packets) | No guarantee (best-effort delivery) |
| **Ordering** | In-order delivery guaranteed via sequence numbers | Packets may arrive out of order |
| **Speed & Overhead**| Slower due to 20-byte header, acknowledgments & flow control | Fast and lightweight with small 8-byte header |
| **Use Cases** | Web pages (HTTP/HTTPS), file transfers (FTP), email (SMTP) | Video streaming, VoIP calls, online multiplayer games, DNS |

#### 2. The TCP 3-Way Handshake:
Before transmitting data, client and server establish a synchronized session:
1. **SYN:** Client sends a synchronization packet with initial sequence number ($X$).
2. **SYN-ACK:** Server acknowledges with $\\text{ACK} = X + 1$ and sends its own initial sequence number ($Y$).
3. **ACK:** Client acknowledges server with $\\text{ACK} = Y + 1$. Connection is now **ESTABLISHED**!`,
  },

  // ── 6. ARTIFICIAL INTELLIGENCE & MACHINE LEARNING ──
  {
    keywords: ['supervised', 'unsupervised', 'reinforcement', 'machine learning types', 'classification', 'regression', 'clustering'],
    title: 'Supervised vs Unsupervised vs Reinforcement Learning',
    subject: 'Machine Learning (GeeksforGeeks)',
    content: `### Supervised vs Unsupervised vs Reinforcement Learning

| Paradigm | How it Works | Training Data | Core Tasks | Real-World Examples |
| :--- | :--- | :--- | :--- | :--- |
| **Supervised Learning** | Learns a mapping function from labeled input-output pairs ($X \\rightarrow Y$). | Labeled dataset $(x_i, y_i)$ | **Classification** (discrete labels) & **Regression** (continuous numbers) | Spam detection, house price prediction, medical image diagnosis |
| **Unsupervised Learning** | Discovers hidden patterns, structures, and relationships in unlabeled data without target labels. | Unlabeled dataset $(x_i)$ | **Clustering** & **Dimensionality Reduction** | Customer segmentation (K-Means), anomaly detection, PCA |
| **Reinforcement Learning** | An agent learns optimal policy by taking actions in an environment to maximize cumulative reward. | Feedback via rewards and penalties | Policy optimization & sequential decision making | Self-driving cars, Chess/Go game bots (AlphaGo), robotic arm control |`,
  },
  {
    keywords: ['overfitting', 'underfitting', 'regularization', 'bias variance', 'l1', 'l2', 'ridge', 'lasso'],
    title: 'Overfitting vs Underfitting and Regularization (L1/L2)',
    subject: 'Machine Learning (GeeksforGeeks)',
    content: `### Overfitting, Underfitting & Regularization

- **Underfitting (High Bias):** Model is too simple to capture underlying patterns. High error on both training and test data.
- **Good Fit (Optimal Trade-off):** Model generalizes well to unseen real-world data.
- **Overfitting (High Variance):** Model memorizes training noise and details. Low training error, but high test error.

#### How to Combat Overfitting:
1. **Regularization (L1 & L2):** Penalizes overly complex model weights.
   - **L1 Regularization (Lasso):** Adds penalty $\\lambda \\sum |w_i|$. Drives redundant weights to absolute zero (automatic feature selection).
   - **L2 Regularization (Ridge):** Adds penalty $\\lambda \\sum w_i^2$. Shrinks weights smoothly toward zero without eliminating them.
2. **Cross-Validation (k-fold):** Evaluates generalizability across $k$ splits.
3. **Dropout (in Neural Networks):** Randomly zeroes out neurons during training.
4. **Early Stopping:** Halts training when validation loss stops improving.`,
  },

  // ── 7. CYBER SECURITY ──
  {
    keywords: ['sql injection', 'sqli', 'xss', 'cross site scripting', 'csrf', 'security vulnerability'],
    title: 'Top Web Vulnerabilities: SQLi and XSS Explained',
    subject: 'Cyber Security (W3Schools & GeeksforGeeks)',
    content: `### Top Web Vulnerabilities: SQLi & XSS

#### 1. SQL Injection (SQLi)
Occurs when untrusted user input is directly concatenated into dynamic SQL queries without sanitization.
\`\`\`sql
-- Vulnerable query:
SELECT * FROM users WHERE email = '` + `user_input` + `' AND password = '` + `pass` + `';

-- If user enters: admin' OR '1'='1
-- Executed query becomes:
SELECT * FROM users WHERE email = 'admin' OR '1'='1' AND password = '...';
\`\`\`
- **Remediation:** Always use **Parameterized Queries (Prepared Statements)** or modern ORMs:
\`\`\`python
# Safe with Parameterized Query:
cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s", (email, password))
\`\`\`

#### 2. Cross-Site Scripting (XSS)
Occurs when an application includes untrusted user input in a web page without proper escaping, allowing attackers to execute malicious JavaScript in victims' browsers (stealing cookies/session tokens).
- **Remediation:** Escape HTML output, implement a strict **Content Security Policy (CSP)**, and store sensitive session tokens in \`HttpOnly; Secure; SameSite=Strict\` cookies.`,
  },
  {
    keywords: ['encryption', 'rsa', 'aes', 'symmetric', 'asymmetric', 'hashing', 'salt', 'cryptography'],
    title: 'Symmetric vs Asymmetric Encryption & Password Hashing',
    subject: 'Cyber Security (GeeksforGeeks)',
    content: `### Cryptography: Symmetric vs Asymmetric & Hashing

#### 1. Symmetric vs Asymmetric Encryption:
- **Symmetric Encryption (e.g. AES-256):** Uses a **single shared secret key** for both encryption and decryption. Very fast, ideal for encrypting bulk data (hard drives, TLS session streams).
- **Asymmetric Encryption (e.g. RSA, ECC):** Uses a **key pair** (Public Key to encrypt, Private Key to decrypt). Solves the key-distribution problem. Used in digital signatures and initial TLS handshakes.

#### 2. Hashing vs Encryption:
- **Encryption:** Two-way function (ciphertext can be decrypted back to plaintext with the appropriate key).
- **Hashing (e.g. SHA-256, bcrypt):** One-way mathematical function. You cannot mathematically invert a hash to recover the plaintext password.

#### 3. Why Password Salting is Essential:
A **Salt** is a random string concatenated to each password before hashing.
- It guarantees that identical passwords generate completely unique hashes.
- It completely thwarts precomputed **Rainbow Table** attacks!`,
  },

  // ── 8. WEB DEVELOPMENT ──
  {
    keywords: ['flexbox', 'grid', 'css flexbox', 'css grid', 'align items', 'justify content'],
    title: 'CSS Flexbox vs CSS Grid: Layout Mastery',
    subject: 'Web Development (W3Schools CSS)',
    content: `### CSS Flexbox vs CSS Grid

Both modern CSS layout modules make responsive web design clean and robust.

| Feature | CSS Flexbox | CSS Grid |
| :--- | :--- | :--- |
| **Dimension** | **1-Dimensional** (Row OR Column) | **2-Dimensional** (Rows AND Columns simultaneously) |
| **Design Focus** | Content-first: items dictate their sizing and wrap naturally. | Layout-first: rigid grid structure dictates where items sit. |
| **Best For** | Navbars, button groups, aligning icons with text, card item strips. | Complex full-page layouts, photo galleries, dashboards, magazine grids. |

\`\`\`css
/* Flexbox Example (Center everything) */
.flex-container {
  display: flex;
  justify-content: center; /* Main axis alignment */
  align-items: center;     /* Cross axis alignment */
  gap: 1rem;
}

/* Grid Example (Auto-responsive 3-column cards) */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
\`\`\``,
  },
  {
    keywords: ['react', 'virtual dom', 'useeffect', 'hooks', 'reconciliation', 'component lifecycle'],
    title: 'React Virtual DOM and the useEffect Lifecycle',
    subject: 'Web Development (W3Schools React)',
    content: `### React Virtual DOM & The useEffect Lifecycle

#### 1. What is the Virtual DOM?
The **Virtual DOM (VDOM)** is a lightweight JavaScript representation of the real browser DOM.
1. When state changes, React creates a new Virtual DOM tree.
2. React runs the **Diffing Algorithm (Reconciliation)** to compare the new VDOM with the snapshot of the previous VDOM.
3. React batches the minimal set of required mutations and updates **only the changed nodes** in the real browser DOM, maximizing rendering performance!

#### 2. \`useEffect\` Dependency Array Patterns:
\`\`\`jsx
import { useEffect, useState } from 'react';

function UserTracker({ userId }) {
  const [data, setData] = useState(null);

  // 1. Runs ONCE on mount (empty dependency array)
  useEffect(() => {
    console.log("Component mounted!");
    return () => console.log("Component unmounted!"); // Cleanup function
  }, []);

  // 2. Runs on mount AND whenever 'userId' changes
  useEffect(() => {
    fetchUserData(userId).then(setData);
  }, [userId]);

  return <div>{data?.name}</div>;
}
\`\`\``,
  },
  {
    keywords: ['jwt', 'json web token', 'token', 'auth header', 'bearer', 'rest api', 'http status'],
    title: 'JWT Authentication and RESTful API Principles',
    subject: 'Web Development (GeeksforGeeks / W3Schools)',
    content: `### JWT Authentication & REST API Principles

#### 1. Structure of a JSON Web Token (JWT)
A JWT consists of three parts separated by dots (\`header.payload.signature\`):
- **Header:** Token type (\`JWT\`) and hashing algorithm (e.g. \`HS256\`).
- **Payload:** User claims (e.g. \`sub: "123"\`, \`email: "dev@domain.com"\`, \`role: "admin"\`, \`exp: 1718000000\`).
- **Signature:** Created by hashing the encoded header + encoded payload using a server-side secret key.

#### 2. REST HTTP Status Codes:
- **200 OK:** Standard success response.
- **201 Created:** New resource successfully created (e.g. after POST).
- **204 No Content:** Action successful with empty response body (e.g. after DELETE).
- **400 Bad Request:** Malformed request syntax or client validation error.
- **401 Unauthorized:** User authentication is missing or token is invalid.
- **403 Forbidden:** Authenticated user lacks permission for this resource.
- **404 Not Found:** Target resource does not exist.
- **500 Internal Server Error:** Unexpected backend runtime failure.`,
  },
];

/**
 * Intelligent domain lookup and out-of-scope classifier
 */
export function queryCSKnowledgeBase(query: string): {
  found: boolean;
  entry?: KnowledgeEntry;
  outOfScopeResponse?: string;
} {
  const cleaned = query.toLowerCase().trim();

  // 1. Non-CS blacklist check (entertainment, medical, cooking, sports, astrology, gossip, etc.)
  const nonCsKeywords = [
    'recipe', 'cook', 'bake', 'food', 'cricket', 'football', 'ipl', 'nba',
    'movie', 'actor', 'actress', 'song', 'lyrics', 'horoscope', 'astrology',
    'zodiac', 'weather in', 'president of', 'prime minister', 'dating',
    'makeup', 'stock market tip', 'bitcoin price prediction'
  ];

  const hasNonCsIntent = nonCsKeywords.some(w => cleaned.includes(w));
  if (hasNonCsIntent) {
    return {
      found: false,
      outOfScopeResponse: getOutOfScopePoliteMessage(query),
    };
  }

  // 2. Score knowledge entries by keyword matches
  let bestMatch: KnowledgeEntry | null = null;
  let highestScore = 0;

  for (const entry of CS_KNOWLEDGE_ENTRIES) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (cleaned.includes(kw)) {
        score += kw.length; // weight longer phrases higher
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore >= 3) {
    return { found: true, entry: bestMatch };
  }

  // 3. Broad CS topics fallback check (if user mentions any CS terminology)
  const generalCsTerms = [
    'code', 'program', 'function', 'variable', 'loop', 'array', 'string', 'algorithm',
    'database', 'sql', 'query', 'table', 'network', 'ip', 'server', 'client', 'http',
    'operating system', 'linux', 'memory', 'compiler', 'interpreter', 'react', 'javascript',
    'python', 'c++', 'java', 'html', 'css', 'api', 'git', 'bug', 'debug', 'error', 'class',
    'object', 'inheritance', 'recursion', 'stack', 'queue', 'tree', 'graph', 'hash', 'security',
    'encryption', 'ai', 'machine learning', 'neural', 'model', 'data'
  ];

  const isGeneralCs = generalCsTerms.some(term => cleaned.includes(term));
  if (isGeneralCs) {
    // Return structured tutorial breakdown for technical inquiry
    return {
      found: true,
      entry: {
        keywords: [query],
        title: `Computer Science Topic: ${query}`,
        subject: 'Computer Science Study Guide (GeeksforGeeks & W3Schools)',
        content: `### Computer Science Topic Overview: "${query}"

Here is a structured engineering breakdown based on Computer Science standards:

1. **Definition & Core Objective:**
   - Clearly define the problem or concept in computer science.
   - Understand the inputs, expected outputs, and constraints.

2. **Fundamental Implementation Steps:**
   - **Step 1:** Formulate the step-by-step algorithmic logic or architectural design.
   - **Step 2:** Write clean, modular, and readable code with descriptive identifiers.
   - **Step 3:** Validate against edge cases (e.g. empty collections, null references, off-by-one indices, large scales).

3. **Recommended Study Route:**
   - Explore practical code examples in our **Python Mastery**, **C++ & DSA**, or **Web Development** track modules.
   - Practice related problems on GeeksforGeeks or W3Schools tutorials.

*Feel free to ask for a specific code implementation, line-by-line debugging, or time/space complexity analysis!*`,
      },
    };
  }

  // 4. If query does not match CS domain at all, return polite out-of-scope response
  return {
    found: false,
    outOfScopeResponse: getOutOfScopePoliteMessage(query),
  };
}

export function getOutOfScopePoliteMessage(query: string): string {
  return `I apologize, but your question about **"${query}"** is currently outside my technical knowledge base.

As your **DevPilot Computer Science Learning Companion**, my knowledge base is specifically grounded in Computer Science, Software Engineering, and Programming curriculum (incorporating core topics from **GeeksforGeeks** and **W3Schools**).

I am specially trained to assist you in:
- **Programming Fundamentals:** Python, C++, Java, JavaScript, OOP, Pointers & Memory
- **Data Structures & Algorithms (DSA):** Arrays, Trees, Graphs, Sorting, Dynamic Programming & Big-O
- **DBMS:** SQL Queries, Normalization, Joins, ACID Properties & Indexing
- **Operating Systems (OS):** Processes, Threads, CPU Scheduling, Deadlocks & Paging
- **Computer Networks (CN):** OSI 7 Layers, TCP/IP, Subnetting, Routing & DNS
- **AI & Machine Learning:** Supervised/Unsupervised Models, Gradient Descent & Neural Networks
- **Cyber Security:** Cryptography, RSA, AES, SQL Injection & XSS Prevention
- **Web Development:** Modern React, HTML5/CSS3, RESTful APIs & Authentication

Please ask me any programming concept, code debugging, or CS interview question in these areas, and I will be delighted to help!`;
}
