// ============================================================================
// DevPilot - Learning Roadmap Data
// ============================================================================
import type { LearningTopic } from '../types';
import { generateId } from '../utils/helpers';

function t(trackId: string, section: string, order: number, title: string, description: string, exercises: string[] = [], resources: string[] = []): LearningTopic {
  return { id: generateId(), trackId, section, order, title, description, exercises, resources, status: 'not-started', notes: '' };
}

// ── TRACK A: C Programming ──
export const C_TOPICS: LearningTopic[] = [
  t('c', 'C Programming', 1, 'Introduction to Programming', 'Understand what programming is, how computers execute code, and the role of programming languages.', ['Write your first "Hello World" program', 'Explain the compilation process'], ['https://www.learn-c.org/', 'https://www.geeksforgeeks.org/c-programming-language/']),
  t('c', 'C Programming', 2, 'C Installation & Setup', 'Install a C compiler (GCC), set up your IDE or text editor, and compile your first program.', ['Install GCC and compile a program from terminal', 'Set up VS Code for C development'], ['https://code.visualstudio.com/docs/languages/cpp']),
  t('c', 'C Programming', 3, 'Variables & Data Types', 'Learn about int, float, char, double, and how to declare and initialize variables.', ['Declare variables of each type and print them', 'Calculate area of a circle using float variables'], []),
  t('c', 'C Programming', 4, 'Operators', 'Arithmetic, relational, logical, bitwise, assignment and ternary operators.', ['Build a simple calculator', 'Practice bitwise operations'], []),
  t('c', 'C Programming', 5, 'Input & Output', 'Use scanf() and printf() for user interaction, format specifiers.', ['Create a program that takes user input and displays formatted output', 'Practice with different format specifiers'], []),
  t('c', 'C Programming', 6, 'Conditional Statements', 'if, else, else if, switch-case, nested conditions.', ['Write a grade calculator', 'Build a menu-driven program using switch'], []),
  t('c', 'C Programming', 7, 'Loops', 'for, while, do-while loops, break, continue, nested loops.', ['Print multiplication tables', 'Generate number patterns', 'Find factorial of a number'], []),
  t('c', 'C Programming', 8, 'Functions', 'Function declaration, definition, call by value, call by reference, recursion.', ['Write functions for math operations', 'Implement recursive factorial and Fibonacci'], []),
  t('c', 'C Programming', 9, 'Arrays', 'One-dimensional and two-dimensional arrays, array operations.', ['Find largest/smallest element', 'Matrix addition and multiplication', 'Sort an array'], []),
  t('c', 'C Programming', 10, 'Strings', 'Character arrays, string functions (strlen, strcpy, strcmp, strcat), string manipulation.', ['Reverse a string', 'Check for palindrome', 'Count vowels and consonants'], []),
  t('c', 'C Programming', 11, 'Pointers', 'Pointer basics, pointer arithmetic, pointers and arrays, pointers to functions.', ['Swap two numbers using pointers', 'Dynamic array using pointers', 'Understand pointer to pointer'], []),
  t('c', 'C Programming', 12, 'Structures & Unions', 'Define structures, nested structures, arrays of structures, unions, typedef.', ['Create a student record system', 'Implement a simple library system'], []),
  t('c', 'C Programming', 13, 'Dynamic Memory Allocation', 'malloc(), calloc(), realloc(), free(), memory management.', ['Create a dynamic array that grows', 'Implement a linked list'], []),
  t('c', 'C Programming', 14, 'File Handling', 'File operations: fopen, fclose, fread, fwrite, fprintf, fscanf.', ['Read and write student records to a file', 'Copy contents of one file to another'], []),
  t('c', 'C Programming', 15, 'Basic Problem Solving', 'Apply C concepts to solve algorithmic problems.', ['Implement binary search', 'Find GCD and LCM', 'Check for prime numbers', 'Generate Fibonacci series'], []),
  t('c', 'C Programming', 16, 'College Practical Exercises', 'Complete practical programs required by your college curriculum.', ['Follow your college lab manual exercises', 'Practice viva questions'], []),
];

// ── TRACK B: Python Mastery ──
export const PYTHON_TOPICS: LearningTopic[] = [
  // Beginner
  t('python', 'Beginner', 1, 'Introduction to Python', 'Why Python, its history, use cases, comparison with other languages.', ['Research 5 real-world Python applications'], ['https://docs.python.org/3/tutorial/', 'https://www.python.org/about/']),
  t('python', 'Beginner', 2, 'Installation & Environment Setup', 'Install Python, set up VS Code, understand REPL, run your first script.', ['Install Python and VS Code', 'Run a Hello World program'], ['https://code.visualstudio.com/docs/python/python-tutorial']),
  t('python', 'Beginner', 3, 'Variables & Data Types', 'int, float, str, bool, type(), type conversion, naming conventions.', ['Create variables of each type', 'Practice type conversions'], []),
  t('python', 'Beginner', 4, 'Input & Output', 'input(), print(), f-strings, string formatting.', ['Build an interactive greeting program', 'Create a simple unit converter'], []),
  t('python', 'Beginner', 5, 'Operators', 'Arithmetic, comparison, logical, assignment, membership, identity operators.', ['Build a calculator', 'Practice operator precedence problems'], []),
  t('python', 'Beginner', 6, 'Conditional Statements', 'if, elif, else, nested conditions, ternary operator.', ['Build a number guessing game', 'Create a grade calculator', 'BMI calculator with health advice'], []),
  t('python', 'Beginner', 7, 'Loops', 'for, while, range(), break, continue, else with loops, nested loops.', ['Print patterns (triangles, diamonds)', 'Find prime numbers in a range', 'Build a simple menu system'], []),
  t('python', 'Beginner', 8, 'Strings', 'String methods, slicing, indexing, immutability, string operations.', ['Reverse a string', 'Check for anagrams', 'Count word frequency in text'], []),
  t('python', 'Beginner', 9, 'Lists', 'Creating lists, indexing, slicing, list methods, list operations, nested lists.', ['Implement a to-do list', 'Find duplicates in a list', 'Matrix operations with nested lists'], []),
  t('python', 'Beginner', 10, 'Tuples', 'Creating tuples, immutability, tuple packing/unpacking, when to use tuples.', ['Use tuples for coordinates', 'Return multiple values from functions'], []),
  t('python', 'Beginner', 11, 'Sets', 'Set operations, union, intersection, difference, symmetric difference.', ['Remove duplicates from a list using sets', 'Find common elements between lists'], []),
  t('python', 'Beginner', 12, 'Dictionaries', 'Key-value pairs, dict methods, nested dicts, dictionary comprehensions.', ['Build a phone book', 'Word frequency counter', 'Student grade tracker'], []),
  t('python', 'Beginner', 13, 'Functions', 'Defining functions, parameters, return values, *args, **kwargs, lambda, scope.', ['Build a math utility library', 'Create a password validator', 'Implement map/filter with lambda'], []),
  t('python', 'Beginner', 14, 'Basic Problem Solving', 'Apply Python basics to solve coding challenges.', ['Solve 10 easy problems on LeetCode/HackerRank', 'FizzBuzz, palindrome, Fibonacci'], []),
  // Intermediate
  t('python', 'Intermediate', 15, 'File Handling', 'Reading/writing files, CSV, with statement, file modes.', ['Build a diary/journal app', 'CSV data processor', 'Log file analyzer'], []),
  t('python', 'Intermediate', 16, 'Exception Handling', 'try/except/finally, custom exceptions, raising exceptions.', ['Add error handling to previous projects', 'Build a robust input validator'], []),
  t('python', 'Intermediate', 17, 'Modules & Packages', 'Importing modules, creating packages, __init__.py, standard library.', ['Create a utility package', 'Explore os, sys, math, random modules'], []),
  t('python', 'Intermediate', 18, 'Object-Oriented Programming', 'Classes, objects, inheritance, polymorphism, encapsulation, abstraction, magic methods.', ['Build a bank account system', 'Create a library management system', 'Design a simple game with OOP'], []),
  t('python', 'Intermediate', 19, 'List Comprehensions', 'List, dict, set comprehensions, nested comprehensions, conditional comprehensions.', ['Refactor loops to comprehensions', 'Generate complex data structures'], []),
  t('python', 'Intermediate', 20, 'Iterators & Generators', 'Iterator protocol, yield, generator expressions, lazy evaluation.', ['Create a custom range function', 'Build a file reader generator'], []),
  t('python', 'Intermediate', 21, 'Decorators', 'Function decorators, class decorators, @property, @staticmethod, @classmethod.', ['Build a timing decorator', 'Create an authentication decorator', 'Implement memoization'], []),
  t('python', 'Intermediate', 22, 'Virtual Environments', 'venv, virtualenv, managing project dependencies, requirements.txt.', ['Set up a virtual environment for a project', 'Create and use requirements.txt'], []),
  t('python', 'Intermediate', 23, 'pip & Package Management', 'Installing packages, pip commands, pyproject.toml, publishing packages.', ['Install and use popular packages', 'Create a simple installable package'], []),
  t('python', 'Intermediate', 24, 'JSON & Data Formats', 'json module, serialization, deserialization, working with JSON data.', ['Parse a JSON API response', 'Build a config file system using JSON'], []),
  t('python', 'Intermediate', 25, 'Working with APIs', 'RESTful APIs, HTTP methods, API keys, authentication, rate limiting.', ['Fetch data from a public API', 'Build a weather information tool'], ['https://requests.readthedocs.io/']),
  t('python', 'Intermediate', 26, 'HTTP Requests', 'requests library, GET, POST, headers, params, response handling.', ['Build an API client', 'Web scraper for a simple site'], []),
  t('python', 'Intermediate', 27, 'Debugging & Testing', 'pdb, unittest, pytest, test-driven development, debugging techniques.', ['Write unit tests for previous projects', 'Debug a buggy program step by step'], []),
  // Advanced
  t('python', 'Advanced', 28, 'Type Hints', 'Type annotations, mypy, typing module, generics, protocols.', ['Add type hints to a project', 'Run mypy on your code'], []),
  t('python', 'Advanced', 29, 'Async Programming', 'asyncio, async/await, event loops, concurrent tasks.', ['Build an async web scraper', 'Create concurrent API calls'], []),
  t('python', 'Advanced', 30, 'Database Integration', 'SQLite, connection, cursor, CRUD operations, ORMs.', ['Build a CRUD app with SQLite', 'Student database manager'], []),
  t('python', 'Advanced', 31, 'SQL with Python', 'SQLAlchemy basics, queries, relationships, migrations.', ['Convert raw SQL app to SQLAlchemy', 'Build a blog database model'], []),
  t('python', 'Advanced', 32, 'FastAPI or Django', 'Web framework basics, routing, models, templates, middleware.', ['Build a REST API with FastAPI', 'Create a simple blog backend'], ['https://fastapi.tiangolo.com/', 'https://docs.djangoproject.com/']),
  t('python', 'Advanced', 33, 'REST API Development', 'API design, endpoints, serialization, validation, documentation.', ['Design and build a complete REST API', 'Add Swagger/OpenAPI docs'], []),
  t('python', 'Advanced', 34, 'Authentication & Authorization', 'JWT, OAuth2, session management, password hashing.', ['Add JWT auth to your API', 'Implement login/signup flow'], []),
  t('python', 'Advanced', 35, 'Deployment', 'Docker basics, cloud platforms, CI/CD, environment variables.', ['Dockerize a Python application', 'Deploy to a cloud platform'], []),
  t('python', 'Advanced', 36, 'Python Project Development', 'Project structure, documentation, code quality, packaging.', ['Build a complete project with proper structure', 'Write comprehensive documentation'], []),
  t('python', 'Advanced', 37, 'Python for AI/ML Applications', 'Using Python with AI libraries, building AI-powered apps.', ['Build a simple ML model with scikit-learn', 'Create an AI-powered text analyzer'], []),
];

// ── TRACK C: C++ & DSA ──
export const CPP_DSA_TOPICS: LearningTopic[] = [
  // C++ Fundamentals
  t('cpp-dsa', 'C++ Fundamentals', 1, 'C++ Syntax', 'C++ structure, compilation, main function, headers, namespaces.', ['Write and compile a C++ program', 'Understand #include and using namespace std'], ['https://www.learncpp.com/']),
  t('cpp-dsa', 'C++ Fundamentals', 2, 'Variables & Data Types', 'int, float, double, char, bool, string, auto, constants.', ['Declare and use all data types', 'Practice type casting'], []),
  t('cpp-dsa', 'C++ Fundamentals', 3, 'Input & Output', 'cin, cout, getline, formatting output.', ['Build an interactive program', 'Practice formatted output'], []),
  t('cpp-dsa', 'C++ Fundamentals', 4, 'Conditions', 'if/else, switch, ternary operator, nested conditions.', ['Build a decision-making program', 'Menu-driven application'], []),
  t('cpp-dsa', 'C++ Fundamentals', 5, 'Loops', 'for, while, do-while, range-based for, break, continue.', ['Pattern printing problems', 'Sum series problems'], []),
  t('cpp-dsa', 'C++ Fundamentals', 6, 'Functions', 'Function overloading, default parameters, pass by reference, inline functions.', ['Create a math library', 'Practice function overloading'], []),
  t('cpp-dsa', 'C++ Fundamentals', 7, 'Arrays', 'Static arrays, 2D arrays, array manipulation.', ['Implement sorting on arrays', 'Matrix operations'], []),
  t('cpp-dsa', 'C++ Fundamentals', 8, 'Strings', 'std::string, string methods, character manipulation.', ['String reversal', 'Palindrome check', 'Anagram detection'], []),
  t('cpp-dsa', 'C++ Fundamentals', 9, 'Pointers & References', 'Pointer basics, references, dynamic memory (new/delete).', ['Dynamic array allocation', 'Swap using pointers and references'], []),
  t('cpp-dsa', 'C++ Fundamentals', 10, 'Classes & Objects', 'OOP basics, access modifiers, methods, this pointer.', ['Design a Student class', 'Build a simple bank system'], []),
  t('cpp-dsa', 'C++ Fundamentals', 11, 'Constructors', 'Default, parameterized, copy constructors, destructors.', ['Implement all constructor types', 'Resource management example'], []),
  t('cpp-dsa', 'C++ Fundamentals', 12, 'STL Overview', 'Standard Template Library overview, containers, iterators, algorithms.', ['Explore STL documentation', 'Compare STL containers'], ['https://cplusplus.com/reference/stl/']),
  t('cpp-dsa', 'C++ Fundamentals', 13, 'Vectors', 'Dynamic arrays, vector methods, iteration, 2D vectors.', ['Solve array problems using vectors', 'Build a dynamic list'], []),
  t('cpp-dsa', 'C++ Fundamentals', 14, 'Pairs', 'std::pair, make_pair, applications in algorithms.', ['Store and sort coordinate pairs', 'Use pairs in graph problems'], []),
  t('cpp-dsa', 'C++ Fundamentals', 15, 'Maps', 'std::map, std::unordered_map, operations, applications.', ['Frequency counter', 'Two Sum using map'], []),
  t('cpp-dsa', 'C++ Fundamentals', 16, 'Sets', 'std::set, std::unordered_set, operations, applications.', ['Remove duplicates', 'Set intersection/union'], []),
  t('cpp-dsa', 'C++ Fundamentals', 17, 'Stacks', 'std::stack, LIFO principle, applications.', ['Balanced parentheses checker', 'Next greater element'], []),
  t('cpp-dsa', 'C++ Fundamentals', 18, 'Queues', 'std::queue, FIFO principle, deque, applications.', ['BFS implementation', 'Task scheduler'], []),
  t('cpp-dsa', 'C++ Fundamentals', 19, 'Priority Queues', 'std::priority_queue, min-heap, max-heap, applications.', ['Kth largest element', 'Merge K sorted lists'], []),
  // DSA
  t('cpp-dsa', 'DSA', 20, 'Time & Space Complexity', 'Understanding algorithm efficiency, analyzing code complexity.', ['Analyze complexity of common algorithms', 'Compare O(n) vs O(n²) vs O(log n)'], []),
  t('cpp-dsa', 'DSA', 21, 'Big O Notation', 'Formal Big O, Big Omega, Big Theta, amortized analysis.', ['Determine Big O for given code snippets', 'Compare algorithm complexities'], []),
  t('cpp-dsa', 'DSA', 22, 'Arrays (DSA)', 'Array-based problems, sliding window, two pointers, prefix sums.', ['Two Sum', 'Maximum subarray (Kadane\'s)', 'Merge sorted arrays'], []),
  t('cpp-dsa', 'DSA', 23, 'Strings (DSA)', 'String algorithms, pattern matching, manipulation problems.', ['Longest common prefix', 'String compression', 'Valid anagram'], []),
  t('cpp-dsa', 'DSA', 24, 'Searching', 'Linear search, binary search, search variations.', ['Implement linear and binary search', 'Search in rotated sorted array'], []),
  t('cpp-dsa', 'DSA', 25, 'Sorting', 'Bubble, selection, insertion, merge, quick sort, counting sort.', ['Implement all sorting algorithms', 'Compare their performance'], []),
  t('cpp-dsa', 'DSA', 26, 'Binary Search', 'Binary search variations, upper/lower bound, search space problems.', ['Binary search on answer', 'Find peak element', 'Allocate minimum pages'], []),
  t('cpp-dsa', 'DSA', 27, 'Recursion', 'Base cases, recursive thinking, recursion tree, stack overflow.', ['Tower of Hanoi', 'Print all subsequences', 'Power set'], []),
  t('cpp-dsa', 'DSA', 28, 'Backtracking', 'Backtracking template, pruning, constraint satisfaction.', ['N-Queens', 'Sudoku solver', 'Rat in a maze', 'Word search'], []),
  t('cpp-dsa', 'DSA', 29, 'Linked Lists', 'Singly, doubly, circular linked lists, operations, problems.', ['Reverse a linked list', 'Detect cycle', 'Merge two sorted lists'], []),
  t('cpp-dsa', 'DSA', 30, 'Stacks & Queues (DSA)', 'Stack/queue problems, monotonic stack, sliding window maximum.', ['Next greater element', 'Largest rectangle in histogram', 'LRU Cache'], []),
  t('cpp-dsa', 'DSA', 31, 'Hashing', 'Hash tables, collision handling, hash map problems.', ['Group anagrams', 'Longest consecutive sequence', 'Subarray with given sum'], []),
  t('cpp-dsa', 'DSA', 32, 'Trees', 'Binary trees, traversals (inorder, preorder, postorder, level-order), properties.', ['Tree traversals', 'Maximum depth', 'Diameter of tree', 'Level order traversal'], []),
  t('cpp-dsa', 'DSA', 33, 'Binary Search Trees', 'BST operations, validation, balancing, problems.', ['Insert/delete in BST', 'Validate BST', 'Lowest common ancestor'], []),
  t('cpp-dsa', 'DSA', 34, 'Heaps', 'Min-heap, max-heap, heapify, heap sort, problems.', ['Kth largest element', 'Top K frequent elements', 'Merge K sorted lists'], []),
  t('cpp-dsa', 'DSA', 35, 'Graphs', 'Representations, BFS, DFS, connected components, topological sort.', ['BFS/DFS implementations', 'Number of islands', 'Course schedule', 'Shortest path'], []),
  t('cpp-dsa', 'DSA', 36, 'Greedy Algorithms', 'Greedy choice property, activity selection, optimal substructure.', ['Activity selection', 'Fractional knapsack', 'Job scheduling', 'Huffman coding'], []),
  t('cpp-dsa', 'DSA', 37, 'Dynamic Programming', 'Memoization, tabulation, classic DP problems.', ['Fibonacci (DP)', '0/1 Knapsack', 'Longest Common Subsequence', 'Coin change', 'Edit distance'], []),
  t('cpp-dsa', 'DSA', 38, 'Tries', 'Trie structure, insert, search, prefix matching, applications.', ['Implement a Trie', 'Autocomplete system', 'Word search II'], []),
  t('cpp-dsa', 'DSA', 39, 'Advanced Problem Solving', 'Competitive programming patterns, contest problems.', ['Solve medium/hard LeetCode problems', 'Participate in a coding contest'], []),
];

// ── TRACK D: Web Development ──
export const WEBDEV_TOPICS: LearningTopic[] = [
  // Frontend
  t('webdev', 'Frontend', 1, 'HTML', 'HTML structure, elements, attributes, forms, tables, semantic elements.', ['Build a personal webpage', 'Create a form with all input types'], ['https://developer.mozilla.org/en-US/docs/Learn/HTML']),
  t('webdev', 'Frontend', 2, 'Semantic HTML', 'header, nav, main, article, section, aside, footer for accessibility.', ['Refactor a page using semantic HTML', 'Improve accessibility of a page'], []),
  t('webdev', 'Frontend', 3, 'CSS', 'Selectors, box model, colors, typography, backgrounds, borders.', ['Style your personal webpage', 'Create a styled card component'], ['https://developer.mozilla.org/en-US/docs/Learn/CSS']),
  t('webdev', 'Frontend', 4, 'CSS Selectors', 'Class, ID, attribute, pseudo-class, pseudo-element, combinators.', ['Practice complex selectors', 'Style a navigation menu'], []),
  t('webdev', 'Frontend', 5, 'Flexbox', 'Flex container, flex items, alignment, wrapping, ordering.', ['Build a responsive navigation bar', 'Create a card layout with flexbox'], []),
  t('webdev', 'Frontend', 6, 'CSS Grid', 'Grid container, grid items, template areas, auto-fill, auto-fit.', ['Build a magazine-style layout', 'Create a responsive image gallery'], []),
  t('webdev', 'Frontend', 7, 'Responsive Design', 'Media queries, mobile-first, viewport, responsive images, fluid typography.', ['Make your website mobile-responsive', 'Test on multiple screen sizes'], []),
  t('webdev', 'Frontend', 8, 'JavaScript Fundamentals', 'Variables, data types, operators, functions, arrays, objects, ES6+.', ['Build a calculator', 'Create an interactive quiz', 'Build a to-do list'], ['https://javascript.info/']),
  t('webdev', 'Frontend', 9, 'DOM Manipulation', 'Selecting elements, modifying content, styles, creating/removing elements.', ['Dynamic list manager', 'Interactive color picker'], []),
  t('webdev', 'Frontend', 10, 'Events', 'Event listeners, event types, event delegation, event bubbling.', ['Keyboard shortcut handler', 'Drag and drop interface'], []),
  t('webdev', 'Frontend', 11, 'Promises', 'Promise creation, chaining, Promise.all, Promise.race, error handling.', ['Chain multiple API calls', 'Build a loading indicator'], []),
  t('webdev', 'Frontend', 12, 'Async/Await', 'Async functions, await, error handling with try/catch, parallel execution.', ['Refactor promise code to async/await', 'Build an async data loader'], []),
  t('webdev', 'Frontend', 13, 'Fetch API', 'GET, POST requests, headers, response handling, error handling.', ['Build a GitHub user finder', 'Create a weather app using Fetch'], []),
  t('webdev', 'Frontend', 14, 'Git', 'Version control, commits, branches, merging, resolving conflicts.', ['Initialize a repo and practice commits', 'Create and merge branches'], ['https://git-scm.com/doc']),
  t('webdev', 'Frontend', 15, 'GitHub', 'Remote repositories, push/pull, pull requests, collaboration, GitHub Pages.', ['Push a project to GitHub', 'Deploy a site with GitHub Pages'], []),
  t('webdev', 'Frontend', 16, 'React', 'Components, JSX, rendering, virtual DOM, create-react-app/Vite.', ['Create a React app with Vite', 'Build a component-based UI'], ['https://react.dev/']),
  t('webdev', 'Frontend', 17, 'Components', 'Functional components, composition, children, reusability.', ['Build a component library (Button, Card, Modal)', 'Create a layout system'], []),
  t('webdev', 'Frontend', 18, 'Props & State', 'Passing props, state management, lifting state up, controlled components.', ['Build a counter with state', 'Create a form with controlled inputs'], []),
  t('webdev', 'Frontend', 19, 'React Hooks', 'useState, useEffect, useContext, useRef, useMemo, useCallback, custom hooks.', ['Build a custom useFetch hook', 'Create a theme toggle with useContext'], []),
  t('webdev', 'Frontend', 20, 'Routing', 'React Router, routes, navigation, URL parameters, protected routes.', ['Add routing to a React app', 'Build a multi-page application'], []),
  t('webdev', 'Frontend', 21, 'Forms & Validation', 'Form handling, validation, error messages, submission.', ['Build a registration form with validation', 'Create a multi-step form'], []),
  t('webdev', 'Frontend', 22, 'TypeScript', 'Types, interfaces, generics, enums, type guards, utility types.', ['Convert a JS project to TypeScript', 'Build a typed API client'], ['https://www.typescriptlang.org/docs/']),
  // Backend
  t('webdev', 'Backend', 23, 'Client-Server Architecture', 'How web apps work, request-response cycle, servers, clients.', ['Diagram a client-server architecture', 'Trace a web request lifecycle'], []),
  t('webdev', 'Backend', 24, 'HTTP & HTTPS', 'HTTP methods, status codes, headers, HTTPS, SSL/TLS.', ['Use browser dev tools to inspect HTTP requests', 'Understand common status codes'], []),
  t('webdev', 'Backend', 25, 'REST APIs', 'REST principles, resources, endpoints, CRUD, API design best practices.', ['Design a REST API for a blog', 'Document API endpoints'], []),
  t('webdev', 'Backend', 26, 'Node.js & Express', 'Node.js basics, Express framework, middleware, routing.', ['Build a basic Express server', 'Create REST API endpoints'], ['https://expressjs.com/']),
  t('webdev', 'Backend', 27, 'Python FastAPI', 'FastAPI basics, path parameters, request body, validation, auto-docs.', ['Build a FastAPI backend', 'Create CRUD endpoints'], ['https://fastapi.tiangolo.com/']),
  t('webdev', 'Backend', 28, 'Authentication', 'Session-based, token-based (JWT), OAuth, password hashing.', ['Implement JWT authentication', 'Build login/logout flow'], []),
  t('webdev', 'Backend', 29, 'Authorization', 'Roles, permissions, middleware, access control.', ['Add role-based access to an API', 'Protect admin routes'], []),
  t('webdev', 'Backend', 30, 'SQL', 'SQL syntax, SELECT, INSERT, UPDATE, DELETE, JOINs, aggregations.', ['Write queries for a blog database', 'Practice JOINs and subqueries'], []),
  t('webdev', 'Backend', 31, 'PostgreSQL', 'Setup, psql, data types, indexes, constraints, pgAdmin.', ['Set up a PostgreSQL database', 'Create tables with relationships'], ['https://www.postgresql.org/docs/']),
  t('webdev', 'Backend', 32, 'Database Design', 'Normalization, ER diagrams, relationships, migrations.', ['Design a database for an e-commerce site', 'Create an ER diagram'], []),
  t('webdev', 'Backend', 33, 'API Security', 'CORS, rate limiting, input validation, SQL injection prevention, XSS.', ['Add CORS to your API', 'Implement input validation'], []),
  t('webdev', 'Backend', 34, 'Deployment', 'Hosting options, Docker, CI/CD, environment variables, domain setup.', ['Deploy a full-stack app', 'Set up a CI/CD pipeline'], []),
  t('webdev', 'Backend', 35, 'Full-Stack Development', 'Connecting frontend and backend, full-stack project architecture.', ['Build a complete full-stack application', 'Connect React frontend to API backend'], []),
];

// ── TRACK E: System Design ──
export const SYSTEM_DESIGN_TOPICS: LearningTopic[] = [
  // Fundamentals
  t('system-design', 'Fundamentals', 1, 'How the Internet Works', 'IP addresses, TCP/IP, DNS resolution, routing, packets.', ['Trace a URL request from browser to server', 'Explain DNS resolution step by step'], []),
  t('system-design', 'Fundamentals', 2, 'Client-Server Architecture', 'Request-response model, stateless/stateful, thin/thick clients.', ['Diagram a web application architecture', 'Compare different architectures'], []),
  t('system-design', 'Fundamentals', 3, 'HTTP & HTTPS', 'HTTP/1.1, HTTP/2, HTTP/3, SSL/TLS handshake, certificates.', ['Compare HTTP versions', 'Explain the HTTPS handshake'], []),
  t('system-design', 'Fundamentals', 4, 'DNS', 'DNS hierarchy, records (A, CNAME, MX), caching, propagation.', ['Trace DNS resolution for a domain', 'Understand DNS record types'], []),
  t('system-design', 'Fundamentals', 5, 'APIs', 'REST, GraphQL, gRPC, WebSocket, API versioning.', ['Compare REST vs GraphQL', 'Design an API for a todo app'], []),
  t('system-design', 'Fundamentals', 6, 'REST', 'REST principles, HATEOAS, idempotency, resource naming.', ['Design RESTful endpoints for a social media app', 'Practice API naming conventions'], []),
  t('system-design', 'Fundamentals', 7, 'Databases', 'Database types, ACID properties, transactions, indexing basics.', ['Compare database types', 'Explain ACID with examples'], []),
  t('system-design', 'Fundamentals', 8, 'SQL vs NoSQL', 'Relational vs document/key-value/graph databases, when to use which.', ['Choose a database for given scenarios', 'Compare MongoDB vs PostgreSQL'], []),
  t('system-design', 'Fundamentals', 9, 'Database Indexing', 'B-tree, hash indexes, composite indexes, index optimization.', ['Explain how indexes speed up queries', 'Practice index selection'], []),
  t('system-design', 'Fundamentals', 10, 'Caching', 'Cache strategies, Redis, Memcached, CDNs, cache invalidation.', ['Design a caching strategy for a blog', 'Explain cache eviction policies'], []),
  // Intermediate
  t('system-design', 'Intermediate', 11, 'Load Balancing', 'Round-robin, least connections, consistent hashing, health checks.', ['Design a load balancer for a web app', 'Compare load balancing algorithms'], []),
  t('system-design', 'Intermediate', 12, 'Horizontal & Vertical Scaling', 'Scale up vs scale out, auto-scaling, scaling databases.', ['Plan scaling strategy for growing app', 'Compare scaling approaches'], []),
  t('system-design', 'Intermediate', 13, 'Monolith Architecture', 'Monolith pros/cons, when to use, migration strategies.', ['Design a monolithic application', 'Identify when to break it apart'], []),
  t('system-design', 'Intermediate', 14, 'Microservices', 'Service decomposition, communication, service discovery, API gateway.', ['Break a monolith into microservices', 'Design inter-service communication'], []),
  t('system-design', 'Intermediate', 15, 'Message Queues', 'RabbitMQ, Kafka, pub/sub, event-driven architecture.', ['Design an event-driven notification system', 'Compare message queue solutions'], []),
  t('system-design', 'Intermediate', 16, 'Database Replication', 'Master-slave, master-master, read replicas, consistency.', ['Design replication for high availability', 'Explain consistency trade-offs'], []),
  t('system-design', 'Intermediate', 17, 'Database Sharding', 'Horizontal partitioning, shard keys, resharding, consistent hashing.', ['Choose sharding strategy for a user database', 'Explain resharding challenges'], []),
  t('system-design', 'Intermediate', 18, 'Authentication & Authorization', 'OAuth 2.0, JWT, SSO, RBAC, session management at scale.', ['Design auth for a multi-tenant app', 'Compare auth strategies'], []),
  t('system-design', 'Intermediate', 19, 'Rate Limiting', 'Token bucket, sliding window, distributed rate limiting.', ['Design a rate limiter for an API', 'Implement token bucket algorithm'], []),
  t('system-design', 'Intermediate', 20, 'Logging & Monitoring', 'Structured logging, metrics, alerting, ELK stack, Prometheus.', ['Design a monitoring dashboard', 'Set up basic logging strategy'], []),
  t('system-design', 'Intermediate', 21, 'Reliability', 'Fault tolerance, redundancy, failover, disaster recovery, SLAs.', ['Design for 99.9% uptime', 'Plan a disaster recovery strategy'], []),
  t('system-design', 'Intermediate', 22, 'Availability', 'CAP theorem, consistency patterns, eventual consistency, quorum.', ['Explain CAP theorem with examples', 'Design for high availability'], []),
  // Design Exercises
  t('system-design', 'Design Exercises', 23, 'Design a URL Shortener', 'Problem: Build a system like bit.ly. Consider hashing, storage, redirection, analytics, and scale.', ['Write requirements', 'Design database schema', 'Plan API endpoints', 'Draw architecture diagram'], []),
  t('system-design', 'Design Exercises', 24, 'Design a Chat Application', 'Problem: Build a real-time messaging system. Consider WebSocket, message storage, presence, delivery.', ['Define real-time requirements', 'Design message delivery system', 'Plan database for messages'], []),
  t('system-design', 'Design Exercises', 25, 'Design a File Storage System', 'Problem: Build a system like Google Drive. Consider uploads, storage, sharing, sync, deduplication.', ['Design file upload flow', 'Plan metadata storage', 'Design sharing permissions'], []),
  t('system-design', 'Design Exercises', 26, 'Design a Notification System', 'Problem: Build multi-channel notifications. Consider push, email, SMS, priority, batching, templates.', ['Design notification routing', 'Plan template system', 'Handle delivery failures'], []),
  t('system-design', 'Design Exercises', 27, 'Design a Social Media Feed', 'Problem: Build a news feed like Twitter/Instagram. Consider fan-out, ranking, caching, pagination.', ['Design feed generation', 'Plan caching strategy', 'Handle viral content'], []),
  t('system-design', 'Design Exercises', 28, 'Design an AI Chatbot Application', 'Problem: Build a production AI chatbot. Consider LLM integration, context, rate limiting, cost.', ['Design LLM API integration', 'Plan conversation storage', 'Handle rate limiting and costs'], []),
];

// ── TRACK F: AI/ML Development ──
export const AIML_TOPICS: LearningTopic[] = [
  t('ai-ml', 'AI Fundamentals', 1, 'AI Fundamentals', 'What is AI, types of AI, history, current state, applications in software.', ['List 10 AI-powered applications you use daily', 'Explain the difference between AI, ML, and DL'], ['https://developers.google.com/machine-learning/crash-course']),
  t('ai-ml', 'AI Fundamentals', 2, 'Machine Learning Basics', 'Supervised, unsupervised, reinforcement learning, training, evaluation.', ['Train a simple classifier with scikit-learn', 'Evaluate model accuracy'], []),
  t('ai-ml', 'AI Fundamentals', 3, 'Deep Learning Overview', 'Neural networks, layers, activation functions, training, frameworks.', ['Understand a simple neural network architecture', 'Explore PyTorch/TensorFlow basics'], []),
  t('ai-ml', 'AI Fundamentals', 4, 'Large Language Models', 'Transformers, GPT, BERT, tokenization, context windows, capabilities, limitations.', ['Experiment with different LLM outputs', 'Compare model capabilities'], []),
  t('ai-ml', 'Building with AI APIs', 5, 'AI APIs', 'OpenAI API, Google Gemini API, Anthropic API, Hugging Face, API design.', ['Make your first API call to an LLM', 'Compare different AI provider APIs'], []),
  t('ai-ml', 'Building with AI APIs', 6, 'Prompt Engineering', 'System prompts, few-shot learning, chain-of-thought, prompt templates.', ['Write effective prompts for different tasks', 'Build a prompt template library'], []),
  t('ai-ml', 'Building with AI APIs', 7, 'Structured Outputs', 'JSON mode, function schemas, Pydantic models, output parsing.', ['Get structured JSON from an LLM', 'Build a data extraction pipeline'], []),
  t('ai-ml', 'Building with AI APIs', 8, 'Embeddings', 'Text embeddings, similarity search, embedding models, dimensions.', ['Generate embeddings for text', 'Build a semantic search demo'], []),
  t('ai-ml', 'Building with AI APIs', 9, 'Vector Databases', 'Pinecone, ChromaDB, FAISS, indexing, similarity search at scale.', ['Set up a local vector database', 'Store and query embeddings'], []),
  t('ai-ml', 'Building AI Applications', 10, 'RAG (Retrieval-Augmented Generation)', 'Document loading, chunking, embedding, retrieval, generation.', ['Build a RAG system from scratch', 'Compare different chunking strategies'], []),
  t('ai-ml', 'Building AI Applications', 11, 'PDF Q&A Applications', 'PDF parsing, text extraction, Q&A over documents.', ['Build a PDF Q&A tool', 'Handle multi-page documents'], []),
  t('ai-ml', 'Building AI Applications', 12, 'AI Chatbots', 'Conversation management, context, memory, streaming responses.', ['Build a chatbot with conversation history', 'Add streaming responses'], []),
  t('ai-ml', 'Building AI Applications', 13, 'Function Calling & Tool Calling', 'Define functions for LLMs, tool schemas, execution, chaining.', ['Build an LLM that calls APIs', 'Create a multi-tool assistant'], []),
  t('ai-ml', 'Building AI Applications', 14, 'AI Agents', 'Agent architecture, planning, tool use, memory, multi-agent systems.', ['Build a simple AI agent', 'Create a research assistant agent'], []),
  t('ai-ml', 'Production & Operations', 15, 'AI Application Evaluation', 'Metrics, benchmarks, human evaluation, A/B testing, bias detection.', ['Evaluate your chatbot quality', 'Set up evaluation metrics'], []),
  t('ai-ml', 'Production & Operations', 16, 'Security & Privacy', 'Prompt injection, data privacy, content filtering, guardrails.', ['Add input/output guardrails', 'Test for prompt injection vulnerabilities'], []),
  t('ai-ml', 'Production & Operations', 17, 'Cost Management', 'Token counting, caching, model selection, batching, cost optimization.', ['Calculate API costs for your app', 'Implement caching to reduce costs'], []),
  t('ai-ml', 'Production & Operations', 18, 'Deploying AI Applications', 'Docker, cloud deployment, API servers, scaling, monitoring.', ['Deploy an AI app to the cloud', 'Set up monitoring and logging'], []),
];

// All tracks for roadmap overview
export const ALL_TRACKS = [
  { id: 'c', name: 'C Programming', color: 'blue', topics: C_TOPICS },
  { id: 'python', name: 'Python Mastery', color: 'emerald', topics: PYTHON_TOPICS },
  { id: 'cpp-dsa', name: 'C++ & DSA', color: 'violet', topics: CPP_DSA_TOPICS },
  { id: 'webdev', name: 'Web Development', color: 'cyan', topics: WEBDEV_TOPICS },
  { id: 'system-design', name: 'System Design', color: 'amber', topics: SYSTEM_DESIGN_TOPICS },
  { id: 'ai-ml', name: 'AI/ML Development', color: 'rose', topics: AIML_TOPICS },
];

// Default timetable
export const DEFAULT_TIMETABLE = [
  { time: '5:00 – 5:45 AM', startHour: 5, endHour: 5.75, activity: 'Wake up, get ready & breakfast', category: 'personal' },
  { time: '6:00 AM – 2:00 PM', startHour: 6, endHour: 14, activity: 'College', category: 'college' },
  { time: '2:00 – 3:00 PM', startHour: 14, endHour: 15, activity: 'Lunch & rest', category: 'personal' },
  { time: '3:00 – 4:00 PM', startHour: 15, endHour: 16, activity: 'College academics, revision & assignments', category: 'academics' },
  { time: '4:00 – 5:00 PM', startHour: 16, endHour: 17, activity: 'Python learning & practice', category: 'python' },
  { time: '5:00 – 7:00 PM', startHour: 17, endHour: 19, activity: '⛔ Unavailable — strictly blocked', category: 'blocked', isBlocked: true },
  { time: '7:00 – 8:00 PM', startHour: 19, endHour: 20, activity: 'C++ & DSA practice', category: 'cpp-dsa' },
  { time: '8:00 – 8:30 PM', startHour: 20, endHour: 20.5, activity: 'Dinner & break', category: 'personal' },
  { time: '8:30 – 9:15 PM', startHour: 20.5, endHour: 21.25, activity: 'Web Development / System Design', category: 'webdev' },
  { time: '9:15 – 9:30 PM', startHour: 21.25, endHour: 21.5, activity: 'Revision & tomorrow\'s planning', category: 'planning' },
  { time: '9:30 PM', startHour: 21.5, endHour: 22, activity: 'Sleep', category: 'personal' },
];

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySlot[] = [
  { id: 'ws-1', day: 'Monday', timeSlot: '8:30 – 9:15 PM', activity: 'Web Development', category: 'webdev' },
  { id: 'ws-2', day: 'Tuesday', timeSlot: '8:30 – 9:15 PM', activity: 'System Design', category: 'system-design' },
  { id: 'ws-3', day: 'Wednesday', timeSlot: '8:30 – 9:15 PM', activity: 'Web Development', category: 'webdev' },
  { id: 'ws-4', day: 'Thursday', timeSlot: '8:30 – 9:15 PM', activity: 'System Design', category: 'system-design' },
  { id: 'ws-5', day: 'Friday', timeSlot: '8:30 – 9:15 PM', activity: 'Python Practice', category: 'python' },
  { id: 'ws-6', day: 'Saturday', timeSlot: '8:30 – 9:15 PM', activity: 'Web Development Project', category: 'webdev' },
  { id: 'ws-7', day: 'Sunday', timeSlot: '8:30 – 9:15 PM', activity: 'Weekly Revision & Project Work', category: 'review' },
];

export const DEFAULT_PROJECTS = [
  { title: 'Personal Task Manager', description: 'A task management app with categories, priorities, and due dates.', technologies: ['Python', 'Flask', 'SQLite', 'HTML/CSS'] },
  { title: 'Weather Application', description: 'A weather app that fetches data from a weather API.', technologies: ['JavaScript', 'React', 'Weather API', 'CSS'] },
  { title: 'Notes Application', description: 'A notes app with CRUD operations and search.', technologies: ['React', 'TypeScript', 'IndexedDB'] },
  { title: 'Expense Tracker', description: 'Track daily expenses with charts and categories.', technologies: ['React', 'TypeScript', 'Recharts', 'LocalStorage'] },
  { title: 'Full-Stack Blog', description: 'A complete blog with posts, comments, and authentication.', technologies: ['React', 'Node.js', 'PostgreSQL', 'JWT'] },
  { title: 'Personal Portfolio', description: 'A developer portfolio website showcasing your projects.', technologies: ['React', 'TypeScript', 'Tailwind CSS'] },
  { title: 'AI Chatbot', description: 'A chatbot powered by an LLM API with conversation history.', technologies: ['Python', 'FastAPI', 'OpenAI API', 'React'] },
  { title: 'PDF Q&A Assistant', description: 'Upload PDFs and ask questions about their content using AI.', technologies: ['Python', 'LangChain', 'ChromaDB', 'FastAPI'] },
  { title: 'AI-Powered Study Assistant', description: 'An AI assistant that helps you study and explains concepts.', technologies: ['Python', 'FastAPI', 'Gemini API', 'React'] },
  { title: 'AI Document Search', description: 'Search through documents using semantic search and AI.', technologies: ['Python', 'Embeddings', 'Vector DB', 'FastAPI'] },
];

import type { WeeklySlot } from '../types';
