<script lang="ts">
	import { Card } from "@/lib/components/ui/card";
	import { Activity, Plus } from "lucide-svelte";


</script>

<div class="space-y-4">
  <div>
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-medium text-gray-900 dark:text-white">Overall Success Rate</h3>
      <span class="text-lg font-semibold text-green-600 dark:text-green-400">67%</span>
    </div>
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div class="bg-green-500 h-2 rounded-full" style:width="67%"></div>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <Card className="p-4 text-center">
      <div class="text-2xl font-bold text-gray-900 dark:text-white">6</div>
      <div class="text-sm text-gray-600 dark:text-gray-400">Test Suites</div>
    </Card>
    <Card className="p-4 text-center">
      <div class="text-2xl font-bold text-gray-900 dark:text-white">156</div>
      <div class="text-sm text-gray-600 dark:text-gray-400">Total Tests</div>
    </Card>
  </div>

  <div>
    <h3 class="font-medium text-gray-900 dark:text-white mb-3">Recent Activity</h3>
    <div class="space-y-3">
      <Card className="p-3">
        <div class="flex items-center gap-3">
          <Activity class="h-4 w-4 text-blue-500" />
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white">Test run for Authentication</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">2 mins ago</p>
          </div>
        </div>
      </Card>
      <Card className="p-3">
        <div class="flex items-center gap-3">
          <Activity class="h-4 w-4 text-blue-500" />
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white">Test run for Checkout Flow</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">5 mins ago</p>
          </div>
        </div>
      </Card>
      <Card className="p-3">
        <div class="flex items-center gap-3">
          <Plus class="h-4 w-4 text-green-500" />
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white">Created Mobile Responsive suite</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
          </div>
        </div>
      </Card>
      <Card className="p-3">
        <div class="flex items-center gap-3">
          <Activity class="h-4 w-4 text-blue-500" />
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white">Test run for Product Management</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</div>