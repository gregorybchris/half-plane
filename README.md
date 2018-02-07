# Half-Plane Range Reporting

This is a project for my COMP 150 class (Algorithms with Data Structures). I chose this half-plane range reporting because it lies at the union of two types of algorithms that interest me. It is geometric and also uses fractional cascading.

This method of computing the intersection of a half-plane and a point-set is output sensitive and allows for optimally efficient queries - `O(logn + h)` - after a fast preprocessing step - `O(nlogn)` - where the size of the input is `n` and the size of the output is `h`.
